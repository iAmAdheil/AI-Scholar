import { useEffect, useRef, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import * as DocumentPicker from "expo-document-picker";
import { useTheme } from "@/store/theme";
import { TokenStore } from "@/utils/mmkv";

type Status = "idle" | "uploading" | "queued" | "processing" | "done" | "failed";

const BACKEND = process.env.EXPO_PUBLIC_BACKEND_URL;
const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 5 * 60 * 1000;

export default function UploadPaper() {
  const { value: theme } = useTheme();
  const [status, setStatus] = useState<Status>("idle");
  const [label, setLabel] = useState<string>("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const pollStatus = (jobId: string) => {
    if (pollRef.current) clearInterval(pollRef.current);
    const startedAt = Date.now();
    pollRef.current = setInterval(async () => {
      try {
        const token = TokenStore.get();
        const resp = await fetch(`${BACKEND}/api/v1/papers/status/${encodeURIComponent(jobId)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const body = await resp.json();
        const rq = body?.rq?.status;
        const ledger = body?.ledger?.status;
        const merged: Status =
          ledger === "done" || rq === "finished"
            ? "done"
            : ledger === "failed" || rq === "failed"
              ? "failed"
              : ledger === "processing"
                ? "processing"
                : "queued";
        setStatus(merged);
        if (merged === "done" || merged === "failed") {
          if (pollRef.current) clearInterval(pollRef.current);
          pollRef.current = null;
        }
        if (Date.now() - startedAt > POLL_TIMEOUT_MS) {
          if (pollRef.current) clearInterval(pollRef.current);
          pollRef.current = null;
        }
      } catch (e) {
        // transient — let the next tick try again
      }
    }, POLL_INTERVAL_MS);
  };

  const handlePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (result.canceled || !result.assets || result.assets.length === 0) return;
      const asset = result.assets[0];

      setStatus("uploading");
      setLabel(asset.name || "paper.pdf");

      const form = new FormData();
      // React Native FormData accepts file descriptors with uri/name/type
      form.append("file", {
        uri: asset.uri,
        name: asset.name || "paper.pdf",
        type: asset.mimeType || "application/pdf",
        // @ts-ignore — RN FormData file-descriptor shape
      } as any);
      if (asset.name) form.append("title", asset.name);

      const token = TokenStore.get();
      const resp = await fetch(`${BACKEND}/api/v1/papers/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form as any,
      });
      const body = await resp.json();

      if (!resp.ok) {
        setStatus("failed");
        Alert.alert("Upload failed", body?.msg || "Server rejected the upload");
        return;
      }

      if (body.sync_fallback) {
        setStatus(body.status === "done" ? "done" : "failed");
        return;
      }

      const jobId = body.job_id;
      if (!jobId) {
        setStatus(body.status === "done" ? "done" : "failed");
        return;
      }
      setStatus("queued");
      pollStatus(jobId);
    } catch (e: any) {
      console.log("upload error", e);
      setStatus("failed");
      Alert.alert("Upload failed", e?.message || "Unexpected error");
    }
  };

  const statusText =
    status === "idle"
      ? "Upload a PDF to the knowledge base"
      : status === "uploading"
        ? `Uploading ${label}…`
        : status === "queued"
          ? `Queued: ${label}`
          : status === "processing"
            ? `Embedding ${label}…`
            : status === "done"
              ? `Indexed: ${label}`
              : `Failed: ${label}`;

  return (
    <TouchableOpacity
      onPress={handlePick}
      disabled={status === "uploading" || status === "queued" || status === "processing"}
      style={[
        styles.row,
        { borderColor: theme === "dark" ? "#282828" : "lightgray" },
      ]}
    >
      <Feather
        name="upload-cloud"
        size={18}
        color={theme === "dark" ? "white" : "black"}
      />
      <View style={{ flex: 1 }}>
        <Text style={{ color: theme === "dark" ? "white" : "black", fontWeight: "500" }}>
          Add paper
        </Text>
        <Text style={{ color: "gray", fontSize: 12 }} numberOfLines={1}>
          {statusText}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 12,
    marginTop: 8,
  },
});
