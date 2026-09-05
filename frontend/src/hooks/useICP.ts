import { useEffect, useState } from "react";
import { api } from "../services/api";
import type { ICP } from "../types";

export const useICP = () => {
    const [icps, setIcps] = useState<ICP[]>([]);
    const [selectedIcpId, setSelectedIcpId] = useState("");
    const refresh = async () => {
        const data = await api.listIcps();
        setIcps(data);
        if (!selectedIcpId && data[0]) setSelectedIcpId(data[0].id);
    };
    useEffect(() => {
        void refresh();
    }, []);
    return { icps, selectedIcpId, setSelectedIcpId, refresh };
};
