import { Action, ActionPanel, Form, Clipboard, showHUD, getPreferenceValues } from "@raycast/api";
import imgbbUploader from "imgbb-uploader";
import fileURLToPath from "file-uri-to-path";

import { useState, useEffect } from "react";

const supportedExtensions = ["png", "jpg", "jpeg", "gif", "bmp", "tiff", "webp", "heic", "pdf"];

type Preferences = {
  apiKey: string;
};

const preferences: Preferences = getPreferenceValues();

export default function Command() {
  const [file, setFile] = useState<string[]>([]);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    async function checkIfFileCopied() {
      const { file } = await Clipboard.read();

      console.log(file);
      if (file && supportedExtensions.includes(file.split(".").pop() || "")) {
        const path = fileURLToPath(file);
        setFile([path]);
      }
    }

    checkIfFileCopied();
  }, []);

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Host Image"
            onSubmit={async (values) => {
              if (file.length === 0) {
                setError("No file selected");
                return;
              }

              imgbbUploader(preferences.apiKey, values.files[0])
                .then(async (response: { url: string }) => {
                  await Clipboard.copy(response.url);
                  await showHUD("Image hosted and URL copied to clipboard");
                })
                .catch((error: string) => console.error(error));
            }}
          />
        </ActionPanel>
      }
    >
      <Form.FilePicker
        id="files"
        value={file}
        onChange={(newFile) => {
          if (newFile.length === 0) {
            setFile([]);
            return;
          }

          const ext = newFile[0].split(".").pop();
          if (!ext || !supportedExtensions.includes(ext)) {
            setError("Unsupported file type");
            return;
          }

          console.log(newFile);
          setError(undefined);
          setFile(newFile);
        }}
        allowMultipleSelection={false}
        error={error}
      />

      <Form.Description text="Choose an image to host (png, jpg, jpeg, gif, bmp, tiff, webp, heic, pdf)" />
    </Form>
  );
}
