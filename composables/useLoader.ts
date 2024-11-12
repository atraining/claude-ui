export const useLoader = () => {
    const loader = useState<boolean>("loader", () => false);
    const start = () => (loader.value = true);
    const stop = () => (loader.value = false);
    return { loader, start, stop };
};