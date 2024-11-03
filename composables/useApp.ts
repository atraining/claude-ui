

export const useApp = () => {
    const messages = useState<Array<any>>("messages", () => []);
    const threads = useState<Array<any>>("threads",() => []);
    return {
        messages,
        threads
    };
};