const API_ORIGIN = "https://zipform.zivelo.dev";

function authHeaders(): Record<string, string> {
  const token = process.env.ZIPFORM_TOKEN;
  if (!token) throw new Error("ZIPFORM_TOKEN is not set");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export type FileManifest = {
  key: string;
  title: string;
  fileName: string;
  contentType: "image/png" | "image/jpeg" | "image/webp";
  sizeBytes: number;
  width: number;
  height: number;
};

export type UploadEntry = {
  key: string;
  uploadUrl: string;
};

export type PrepareBatchResponse = {
  uploadBatchId: string;
  generation: number;
  uploads: UploadEntry[];
};

export type AttachmentInfo = {
  externalKey: string;
  title: string;
  contentType: string;
  sizeBytes: number;
  width: number;
  height: number;
  url: string;
  sourceRevision: string;
};

export type AttachmentGroup = {
  groupKey: string;
  sourceRevision: string;
  generation: number;
  attachments: AttachmentInfo[];
};

export async function prepareBatch(
  missionId: string,
  groupKey: string,
  sourceRevision: string,
  files: FileManifest[]
): Promise<PrepareBatchResponse> {
  const res = await fetch(`${API_ORIGIN}/api/v1/missions/${missionId}/attachments`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ groupKey, sourceRevision, files }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`prepareBatch failed (${res.status}): ${body}`);
  }
  const json = await res.json();
  return json.data ?? json;
}

export async function uploadFile(
  uploadUrl: string,
  bytes: Buffer,
  contentType: string
): Promise<void> {
  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: new Uint8Array(bytes),
  });
  if (!res.ok) {
    throw new Error(`Upload failed with HTTP ${res.status}`);
  }
}

export async function finalizeBatch(
  missionId: string,
  uploadBatchId: string
): Promise<{ generation: number }> {
  const res = await fetch(`${API_ORIGIN}/api/v1/missions/${missionId}/attachments`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ uploadBatchId }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`finalizeBatch failed (${res.status}): ${body}`);
  }
  const json = await res.json();
  return json.data ?? json;
}

export async function verifySnapshot(missionId: string): Promise<AttachmentGroup[]> {
  const res = await fetch(`${API_ORIGIN}/api/v1/missions/${missionId}/attachments`, {
    method: "GET",
    headers: authHeaders(),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`verifySnapshot failed (${res.status}): ${body}`);
  }
  const json = await res.json();
  return json.data ?? json;
}
