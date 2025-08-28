export type Observable<T> = {
    name?: string;
    get(effect?: Effect): T;
    set(newValue: T): void;
};
export type ReadableObservable<T> = Pick<Observable<T>, "get" | "name">;
export type Effect = {
    run: () => void;
    dependencies: Set<() => void>;
};
export type ObservableOptions<T> = {
    fallback?: Observable<T>;
    name?: string;
};
export declare function observable<T>(value: T, { fallback, name }?: ObservableOptions<T>): Observable<T>;
export declare function cleanupEffect(effect: Effect): void;
