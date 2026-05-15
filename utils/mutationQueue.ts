import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Sentry } from "../utils/sentry";

interface QueuedMutation {
  id: string;
  method: "POST" | "PUT" | "DELETE";
  path: string;
  body?: unknown;
  createdAt: number;
  retryCount: number;
}

const STORAGE_KEY = "nutrilog-mutation-queue";
const MAX_RETRIES = 5;
const MAX_QUEUE_SIZE = 50;

type ExecuteFn = (method: string, path: string, body?: unknown, headers?: Record<string, string>) => Promise<unknown>;
type FlushCallback = (method: string, path: string, body: unknown, result: unknown) => void;

class MutationQueue {
  private queue: QueuedMutation[] = [];
  private executeFn: ExecuteFn | null = null;
  private flushing = false;
  private unsubscribeNetInfo: (() => void) | null = null;
  private onFlushSuccess: FlushCallback | null = null;

  init(executeFn: ExecuteFn) {
    this.executeFn = executeFn;
    this.loadQueue();
    this.unsubscribeNetInfo = NetInfo.addEventListener((state) => {
      if (state.isConnected && this.queue.length > 0) {
        this.flush();
      }
    });
  }

  setFlushCallback(callback: FlushCallback) {
    this.onFlushSuccess = callback;
  }

  destroy() {
    this.unsubscribeNetInfo?.();
    this.unsubscribeNetInfo = null;
  }

  async enqueue(method: "POST" | "PUT" | "DELETE", path: string, body?: unknown): Promise<void> {
    if (this.queue.length >= MAX_QUEUE_SIZE) {
      const dropped = this.queue.shift();
      Sentry.captureMessage("Mutation queue full, dropping oldest", { extra: { dropped } });
    }
    const mutation: QueuedMutation = {
      id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      method,
      path,
      body,
      createdAt: Date.now(),
      retryCount: 0,
    };
    this.queue.push(mutation);
    await this.saveQueue();
  }

  async flush(): Promise<void> {
    if (this.flushing || !this.executeFn || this.queue.length === 0) return;
    this.flushing = true;

    const toProcess = [...this.queue];
    const failed: QueuedMutation[] = [];

    for (const mutation of toProcess) {
      try {
        const result = await this.executeFn(mutation.method, mutation.path, mutation.body, {
          "Idempotency-Key": mutation.id,
        });
        this.queue = this.queue.filter((m) => m.id !== mutation.id);
        if (this.onFlushSuccess) {
          this.onFlushSuccess(mutation.method, mutation.path, mutation.body, result);
        }
      } catch (e: unknown) {
        mutation.retryCount++;
        if (mutation.retryCount < MAX_RETRIES) {
          failed.push(mutation);
        } else {
          this.queue = this.queue.filter((m) => m.id !== mutation.id);
        }
      }
    }

    await this.saveQueue();
    this.flushing = false;
  }

  get pendingCount(): number {
    return this.queue.length;
  }

  async clear(): Promise<void> {
    this.queue = [];
    await this.saveQueue();
  }

  private async loadQueue(): Promise<void> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        this.queue = JSON.parse(raw);
      }
    } catch (e: unknown) {
      this.queue = [];
    }
  }

  private async saveQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.queue));
    } catch (e) {
      Sentry.captureException(e, { tags: { context: "mutationQueue_save" } });
    }
  }
}

export const mutationQueue = new MutationQueue();
