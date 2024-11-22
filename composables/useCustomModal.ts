export const useCustomModal = () => {
  const isModalOpen = useState<boolean>("isModalOpen", () => false);
  const modalType = useState<string>("modalType", () => "ADD_THREAD");
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
