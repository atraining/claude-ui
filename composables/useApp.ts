

export const useApp = () => {
    const messages = useState<Array<any>>("messages", () => []);
    const threads = useState<Array<any>>("threads",() => []);

    const getThread = async (id: any) => {
        return threads.value.find(thread => thread.id === Number(id));
    };

    return {
        messages,
        getThread,
        threads
    };
};