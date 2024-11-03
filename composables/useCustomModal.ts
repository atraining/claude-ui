export const useCustomModal = () => {
  const isModalOpen = useState<Boolean>("isModalOpen", () => false);
  const modalType = useState<String>("modalType", () => "ADD_THREAD");
  const openModal = () => {
    isModalOpen.value = true;
  };
  const closeModal = () => {
    isModalOpen.value = false;
  };
  return {
    isModalOpen,
    modalType,
    openModal,
    closeModal,
  };
};