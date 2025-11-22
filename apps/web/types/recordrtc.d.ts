declare module 'recordrtc' {
  export default class RecordRTC {
    constructor(stream: MediaStream, options?: any);
    startRecording(): void;
    stopRecording(callback: () => void): void;
    getBlob(): Blob;
    save(fileName: string): void;
    destroy(): void;
    getState(): string;
  }
}
