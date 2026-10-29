import type { LanguageCode, TranscriptSegment } from "@/types";

const DATABASE_NAME = "sabi-workspace";
const DATABASE_VERSION = 2;
const STORE_NAME = "projects";
const PROJECT_KEY = "current";

export interface SavedWorkspace {
  file: File;
  language: LanguageCode;
  transcript: TranscriptSegment[];
  currentTime: number;
  searchQuery: string;
  activeTab: "transcript" | "search";
  isTranscribing: boolean;
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = (event) => {
      const database = request.result;
      const transaction = request.transaction;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME);
      }
      if (!database.objectStoreNames.contains("media")) {
        database.createObjectStore("media");
      }

      if (event.oldVersion < 2 && transaction) {
        const projects = transaction.objectStore(STORE_NAME);
        const media = transaction.objectStore("media");
        const cursorRequest = projects.openCursor();
        cursorRequest.onsuccess = () => {
          const cursor = cursorRequest.result;
          if (!cursor) return;

          const value: unknown = cursor.value;
          if (
            typeof value === "object" &&
            value !== null &&
            "file" in value &&
            value.file instanceof Blob &&
            "fileName" in value &&
            typeof value.fileName === "string" &&
            "fileType" in value &&
            typeof value.fileType === "string" &&
            "lastModified" in value &&
            typeof value.lastModified === "number"
          ) {
            const legacyRecord = value as Record<string, unknown>;
            const { file, fileName, fileType, lastModified, ...project } = legacyRecord;
            media.put({ file, fileName, fileType, lastModified }, cursor.primaryKey);
            cursor.update({ ...project, isTranscribing: project.isTranscribing === true });
          }
          cursor.continue();
        };
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Could not open workspace storage."));
    request.onblocked = () => reject(new Error("Workspace storage is blocked by another open SABI tab."));
  });
}

function isLanguageCode(value: unknown): value is LanguageCode {
  return value === "eng" || value === "yor" || value === "ibo" || value === "hau" || value === "pcm";
}

function isTranscript(value: unknown): value is TranscriptSegment[] {
  return (
    Array.isArray(value) &&
    value.every(
      (segment) =>
        typeof segment === "object" &&
        segment !== null &&
        typeof segment.start === "number" &&
        Number.isFinite(segment.start) &&
        typeof segment.end === "number" &&
        Number.isFinite(segment.end) &&
        typeof segment.text === "string",
    )
  );
}

function parseSavedWorkspace(project: unknown, media: unknown): SavedWorkspace | null {
  if (project === undefined) return null;
  if (
    typeof project !== "object" ||
    project === null ||
    typeof media !== "object" ||
    media === null ||
    !("file" in media) ||
    !(media.file instanceof Blob) ||
    !("fileName" in media) ||
    typeof media.fileName !== "string" ||
    !("fileType" in media) ||
    typeof media.fileType !== "string" ||
    !("lastModified" in media) ||
    typeof media.lastModified !== "number" ||
    !("language" in project) ||
    !isLanguageCode(project.language) ||
    !("transcript" in project) ||
    !isTranscript(project.transcript) ||
    !("currentTime" in project) ||
    typeof project.currentTime !== "number" ||
    !Number.isFinite(project.currentTime) ||
    !("searchQuery" in project) ||
    typeof project.searchQuery !== "string" ||
    !("activeTab" in project) ||
    (project.activeTab !== "transcript" && project.activeTab !== "search") ||
    ("isTranscribing" in project && typeof project.isTranscribing !== "boolean")
  ) {
    throw new Error("The saved SABI workspace is damaged. Clear the project and upload the media again.");
  }

  const file = new File([media.file], media.fileName, {
    type: media.fileType,
    lastModified: media.lastModified,
  });

  return {
    file,
    language: project.language,
    transcript: project.transcript,
    currentTime: Math.max(0, project.currentTime),
    searchQuery: project.searchQuery,
    activeTab: project.activeTab,
    isTranscribing: "isTranscribing" in project && project.isTranscribing === true,
  };
}

export async function loadWorkspace(): Promise<SavedWorkspace | null> {
  const database = await openDatabase();
  try {
    const [project, media] = await new Promise<[unknown, unknown]>((resolve, reject) => {
      const transaction = database.transaction([STORE_NAME, "media"], "readonly");
      const projectRequest = transaction.objectStore(STORE_NAME).get(PROJECT_KEY);
      const mediaRequest = transaction.objectStore("media").get(PROJECT_KEY);
      transaction.oncomplete = () => resolve([projectRequest.result, mediaRequest.result]);
      transaction.onerror = () => reject(transaction.error ?? new Error("Could not read the saved workspace."));
      transaction.onabort = () => reject(transaction.error ?? new Error("Workspace read was interrupted."));
    });
    return parseSavedWorkspace(project, media);
  } finally {
    database.close();
  }
}

export async function saveWorkspace(workspace: SavedWorkspace, saveMedia: boolean): Promise<void> {
  const database = await openDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction([STORE_NAME, "media"], "readwrite");
      if (saveMedia) {
        transaction.objectStore("media").put(
          {
            file: workspace.file,
            fileName: workspace.file.name,
            fileType: workspace.file.type,
            lastModified: workspace.file.lastModified,
          },
          PROJECT_KEY,
        );
      }
      transaction.objectStore(STORE_NAME).put(
        {
          language: workspace.language,
          transcript: workspace.transcript,
          currentTime: workspace.currentTime,
          searchQuery: workspace.searchQuery,
          activeTab: workspace.activeTab,
          isTranscribing: workspace.isTranscribing,
        },
        PROJECT_KEY,
      );
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error("Could not save the workspace."));
      transaction.onabort = () => reject(transaction.error ?? new Error("Workspace save was interrupted."));
    });
  } finally {
    database.close();
  }
}

export async function clearWorkspace(): Promise<void> {
  const database = await openDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction([STORE_NAME, "media"], "readwrite");
      transaction.objectStore(STORE_NAME).delete(PROJECT_KEY);
      transaction.objectStore("media").delete(PROJECT_KEY);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error("Could not clear the saved workspace."));
      transaction.onabort = () => reject(transaction.error ?? new Error("Workspace clear was interrupted."));
    });
  } finally {
    database.close();
  }
}
