import { ref } from "vue";

export function useFileHandler() {
  const file = ref<File | null>(null);

  const triggerFileInput = (inputRef: HTMLInputElement) => {
    inputRef.click();
  };

  const handleFileSelect = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      file.value = target.files[0];
    }
  };

  const removeFile = () => {
    file.value = null;
  };

  return { file, triggerFileInput, handleFileSelect, removeFile };
}
