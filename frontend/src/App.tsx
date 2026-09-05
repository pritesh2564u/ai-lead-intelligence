import {
    type ChangeEvent,
    useEffect,
    useMemo,
    useState,
} from "react";
import {
    BarChart3,
    BrainCircuit,
    Download,
    FileUp,
    Filter,
    Mail,
    Phone,
    Search,
    Sparkles,
    Target,
    TrendingUp,
    UserCheck,
} from "lucide-react";
import { api } from "./services/api";
import { Badge, Button, Card, Dropdown, Input, scoreTone } from "./components/ui";
import { useICP } from "./hooks/useICP";
import { useLeads } from "./hooks/useLeads";
import type { ICP, Lead } from "./types";

const money = (value: number | null) =>
    value
        ? `$${Intl.NumberFormat("en", { notation: "compact" }).format(value)}`
        : "Unknown";
const toUrl = (value: string) =>
    /^https?:\/\//i.test(value) ? value : `https://${value}`;
const person = (lead: Lead) =>
    [lead.ownerFirstName, lead.ownerLastName].filter(Boolean).join(" ") ||
    "Unavailable";

function ScoreBreakdown({ lead }: { lead: Lead }) {
    const rows = lead.score
        ? [
              ["Industry Fit", lead.score.industryFit],
              ["Company Size", lead.score.companySizeFit],
              ["Revenue", lead.score.revenuePotential],
              ["Growth", lead.score.growthSignals],
              ["Contactability", lead.score.contactability],
              ["Decision Maker", lead.score.decisionMakerFit],
              ["Data Quality", lead.score.dataQuality],
          ]
        : [];
    return (
        <div className="space-y-3">
            {rows.map(([label, value]) => (
                <div
                    key={label}
                    className="grid grid-cols-[110px_1fr_36px] items-center gap-2 text-sm sm:grid-cols-[130px_1fr_42px] sm:gap-3"
                >
                    <span className="text-stone-600">{label}</span>
                    <div className="h-2 rounded-full bg-stone-100">
                        <div
                            className="h-2 rounded-full bg-moss"
                            style={{ width: `${value}%` }}
                        />
                    </div>
                    <strong>{value}</strong>
                </div>
            ))}
        </div>
    );
}

function LeadDetail({
    lead,
    icpId,
    onClose,
}: {
    lead: Lead;
    icpId: string;
    onClose: () => void;
}) {
    const [explanation, setExplanation] = useState<Awaited<
        ReturnType<typeof api.explanation>
    > | null>(null);
    const [loading, setLoading] = useState(false);
    const explain = async () => {
        setLoading(true);
        try {
            setExplanation(await api.explanation(lead.id, icpId));
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="fixed inset-0 z-20 bg-black/30" onClick={onClose}>
            <aside
                className="ml-auto flex h-full w-full max-w-2xl flex-col gap-4 overflow-y-auto bg-white p-4 shadow-2xl sm:p-6"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                        <p className="text-sm text-stone-500">{lead.domain}</p>
                        <h2 className="break-words text-xl font-bold sm:text-2xl">
                            {lead.company}
                        </h2>
                        <p className="text-sm text-stone-600">
                            {[lead.city, lead.state].filter(Boolean).join(", ")}{" "}
                            - {lead.industry ?? "Unknown industry"}
                        </p>
                    </div>
                    <Button
                        variant="ghost"
                        className="w-full sm:w-auto"
                        onClick={onClose}
                    >
                        Close
                    </Button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                    <Card>
                        <p className="text-xs uppercase text-stone-500">
                            Opportunity Score
                        </p>
                        <strong className="text-4xl">
                            {lead.score?.totalScore ?? 0}
                        </strong>
                        <span className="text-stone-500"> / 100</span>
                    </Card>
                    <Card>
                        <p className="text-xs uppercase text-stone-500">
                            Recommended Action
                        </p>
                        <strong>
                            {lead.score?.recommendedAction ?? "Analyze first"}
                        </strong>
                    </Card>
                </div>
                <Card>
                    <h3 className="mb-4 font-semibold">Score Breakdown</h3>
                    <ScoreBreakdown lead={lead} />
                </Card>
                <Card>
                    <h3 className="mb-3 font-semibold">Signals</h3>
                    <div className="flex flex-wrap gap-2">
                        {(lead.score?.reasons ?? []).map((item) => (
                            <Badge key={item} tone="high">
                                {item}
                            </Badge>
                        ))}
                        {lead.growthSignals.map((item) => (
                            <Badge key={item}>{item}</Badge>
                        ))}
                        {(lead.score?.concerns ?? []).map((item) => (
                            <Badge key={item} tone="medium">
                                {item}
                            </Badge>
                        ))}
                    </div>
                </Card>
                <Card>
                    <h3 className="mb-3 font-semibold">Contact</h3>
                    <div className="grid gap-2 text-sm">
                        <p>
                            <strong>{person(lead)}</strong>
                            {lead.ownerTitle ? `, ${lead.ownerTitle}` : ""}
                        </p>
                        <p>{lead.ownerEmail ?? "Email unavailable"}</p>
                        <p>
                            {lead.ownerPhone ??
                                lead.companyPhone ??
                                "Phone unavailable"}
                        </p>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                        {lead.ownerEmail && (
                            <Button
                                variant="secondary"
                                onClick={() =>
                                    (location.href = `mailto:${lead.ownerEmail}`)
                                }
                            >
                                <Mail size={16} />
                                Email
                            </Button>
                        )}
                        {(lead.ownerPhone || lead.companyPhone) && (
                            <Button
                                variant="secondary"
                                onClick={() =>
                                    (location.href = `tel:${lead.ownerPhone || lead.companyPhone}`)
                                }
                            >
                                <Phone size={16} />
                                Phone
                            </Button>
                        )}
                        {lead.ownerLinkedin && (
                            <Button
                                variant="secondary"
                                onClick={() =>
                                    window.open(lead.ownerLinkedin!, "_blank")
                                }
                            >
                                LinkedIn
                            </Button>
                        )}
                        {lead.website && (
                            <Button
                                variant="secondary"
                                onClick={() =>
                                    window.open(toUrl(lead.website!), "_blank")
                                }
                            >
                                Website
                            </Button>
                        )}
                    </div>
                </Card>
                <Card>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <h3 className="font-semibold">AI Explanation</h3>
                        <Button
                            className="w-full sm:w-auto"
                            onClick={explain}
                            disabled={!icpId || loading}
                        >
                            <BrainCircuit size={16} />
                            {loading ? "Thinking" : "Generate"}
                        </Button>
                    </div>
                    {explanation && (
                        <div className="mt-4 space-y-3 text-sm">
                            {explanation.unavailable && (
                                <Badge tone="medium">
                                    AI unavailable: deterministic fallback
                                </Badge>
                            )}
                            <p>{explanation.why}</p>
                            <p>
                                <strong>Recommended channel:</strong>{" "}
                                {explanation.recommendedChannel}
                            </p>
                            <p>
                                <strong>Outreach angle:</strong>{" "}
                                {explanation.outreachAngle}
                            </p>
                        </div>
                    )}
                </Card>
            </aside>
        </div>
    );
}

function ICPForm({
    onSave,
}: {
    onSave: (icp: Omit<ICP, "id">) => Promise<void>;
}) {
    const [open, setOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        name: "",
        industry: "",
        locations: "",
        minEmployees: "",
        maxEmployees: "",
        minRevenue: "",
        maxRevenue: "",
        businessType: "",
        targetTitles: "",
        keywords: "",
        excludedIndustries: "",
        growthPreferences: "",
    });
    const set = (field: string) => (e: ChangeEvent<HTMLInputElement>) =>
        setForm({ ...form, [field]: e.target.value });
    const list = (value: string) =>
        value
            .split(/[;,]/)
            .map((item) => item.trim())
            .filter(Boolean);
    const number = (value: string) =>
        value === "" ? null : Number(value);
    const build = async () => {
        if (!form.name.trim() || !form.industry.trim()) return;
        setSaving(true);
        try {
            await onSave({
                name: form.name.trim(),
                industry: form.industry.trim(),
                locations: list(form.locations),
                minEmployees: number(form.minEmployees),
                maxEmployees: number(form.maxEmployees),
                minRevenue: number(form.minRevenue),
                maxRevenue: number(form.maxRevenue),
                businessType: form.businessType.trim() || null,
                targetTitles: list(form.targetTitles),
                keywords: list(form.keywords),
                excludedIndustries: list(form.excludedIndustries),
                growthPreferences: list(form.growthPreferences),
            });
            setForm({
                name: "",
                industry: "",
                locations: "",
                minEmployees: "",
                maxEmployees: "",
                minRevenue: "",
                maxRevenue: "",
                businessType: "",
                targetTitles: "",
                keywords: "",
                excludedIndustries: "",
                growthPreferences: "",
            });
            setOpen(false);
        } finally {
            setSaving(false);
        }
    };
    return (
        <div className="mt-3 border-t border-black/10 pt-3">
            <Button
                variant="ghost"
                className="w-full justify-between"
                onClick={() => setOpen(!open)}
            >
                {open ? "Cancel" : "+ New ICP"}
            </Button>
            {open && (
                <div className="mt-3 space-y-2">
                    <Input
                        placeholder="ICP name * (e.g. California Healthcare)"
                        value={form.name}
                        onChange={set("name")}
                    />
                    <div className="grid grid-cols-2 gap-2">
                        <Input
                            placeholder="Industry * (e.g. Healthcare)"
                            value={form.industry}
                            onChange={set("industry")}
                        />
                        <Input
                            placeholder="Locations (comma separated)"
                            value={form.locations}
                            onChange={set("locations")}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <Input
                            type="number"
                            placeholder="Min employees"
                            value={form.minEmployees}
                            onChange={set("minEmployees")}
                        />
                        <Input
                            type="number"
                            placeholder="Max employees"
                            value={form.maxEmployees}
                            onChange={set("maxEmployees")}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <Input
                            type="number"
                            placeholder="Min revenue ($)"
                            value={form.minRevenue}
                            onChange={set("minRevenue")}
                        />
                        <Input
                            type="number"
                            placeholder="Max revenue ($)"
                            value={form.maxRevenue}
                            onChange={set("maxRevenue")}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <Input
                            placeholder="Business type (e.g. B2B)"
                            value={form.businessType}
                            onChange={set("businessType")}
                        />
                        <Input
                            placeholder="Target titles (comma separated)"
                            value={form.targetTitles}
                            onChange={set("targetTitles")}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <Input
                            placeholder="Keywords (comma separated)"
                            value={form.keywords}
                            onChange={set("keywords")}
                        />
                        <Input
                            placeholder="Excluded industries"
                            value={form.excludedIndustries}
                            onChange={set("excludedIndustries")}
                        />
                    </div>
                    <Input
                        placeholder="Growth preferences (e.g. hiring, funding, expansion)"
                        value={form.growthPreferences}
                        onChange={set("growthPreferences")}
                    />
                    <Button
                        className="w-full"
                        disabled={saving || !form.name.trim() || !form.industry.trim()}
                        onClick={build}
                    >
                        {saving ? "Saving" : "Save ICP"}
                    </Button>
                </div>
            )}
        </div>
    );
}

function LeadCard({
    lead,
    rank,
    onOpen,
}: {
    lead: Lead;
    rank: number;
    onOpen: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onOpen}
            className="w-full rounded-lg border border-black/10 bg-white p-4 text-left shadow-sm transition hover:border-moss/40 hover:bg-mint/20"
        >
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-xs font-bold uppercase text-moss">
                        #{rank}
                    </p>
                    <h3 className="break-words text-base font-bold">
                        {lead.company}
                    </h3>
                    <p className="truncate text-xs text-stone-500">
                        {lead.domain ?? "Domain unavailable"}
                    </p>
                </div>
                <Badge tone={scoreTone(lead.score?.totalScore)}>
                    {lead.score?.totalScore ?? "N/A"}/100
                </Badge>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                    <p className="text-xs text-stone-500">Industry</p>
                    <p className="font-medium">{lead.industry ?? "-"}</p>
                </div>
                <div>
                    <p className="text-xs text-stone-500">Location</p>
                    <p className="font-medium">
                        {[lead.city, lead.state].filter(Boolean).join(", ") ||
                            "-"}
                    </p>
                </div>
                <div>
                    <p className="text-xs text-stone-500">Employees</p>
                    <p className="font-medium">{lead.employees ?? "-"}</p>
                </div>
                <div>
                    <p className="text-xs text-stone-500">Revenue</p>
                    <p className="font-medium">{money(lead.revenue)}</p>
                </div>
            </div>
            <div className="mt-4 border-t border-black/10 pt-3 text-sm">
                <p className="font-medium">{person(lead)}</p>
                <p className="text-stone-500">
                    {lead.ownerTitle || "Decision maker unavailable"}
                </p>
                <p className="mt-2 text-moss">
                    {lead.score?.recommendedAction ?? "Analyze first"}
                </p>
            </div>
        </button>
    );
}

export function App() {
    const {
        leads,
        total,
        page,
        setPage,
        filters,
        setFilters,
        params,
        loading,
        refresh,
    } = useLeads();
    const {
        icps,
        selectedIcpId,
        setSelectedIcpId,
        refresh: refreshIcps,
    } = useICP();
    const [stats, setStats] = useState<Record<string, number>>({});
    const [toast, setToast] = useState("");
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

    const updateStats = async () =>
        setStats(await api.stats().catch(() => ({})));
    useEffect(() => {
        void updateStats();
    }, [leads.length]);

    const run = async (label: string, action: () => Promise<unknown>) => {
        try {
            const result = await action();
            setToast(`${label} complete`);
            await Promise.all([refresh(), updateStats(), refreshIcps()]);
            return result;
        } catch (error) {
            setToast(
                error instanceof Error ? error.message : `${label} failed`,
            );
        }
    };

    const smartFilters = [
        ["Top Opportunities", { minScore: "80" }, Sparkles],
        ["Ready to Contact", { email: "true" }, Mail],
        ["Decision Makers", { decisionMaker: "true" }, UserCheck],
        ["Growth Companies", { growth: "true" }, TrendingUp],
        ["High Value", { minScore: "80", sort: "revenue" }, Target],
    ] as const;
    const totalPages = Math.max(1, Math.ceil(total / 15));
    const selectedIcp = useMemo(
        () => icps.find((icp) => icp.id === selectedIcpId),
        [icps, selectedIcpId],
    );

    return (
        <main className="min-h-screen">
            <header className="border-b border-black/10 bg-white">
                <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-5 sm:px-5 sm:py-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                        <h1 className="text-2xl font-bold tracking-normal sm:text-3xl">
                            AI Lead Intelligence
                        </h1>
                        <p className="text-sm text-stone-600 sm:text-base">
                            Find the prospects worth contacting first.
                        </p>
                    </div>
                    <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 lg:flex lg:w-auto lg:flex-wrap">
                        <Button
                            className="w-full lg:w-auto"
                            variant="secondary"
                            onClick={() => run("Demo ICP", () => api.demoIcp())}
                        >
                            Use Demo ICP
                        </Button>
                        <Button
                            className="w-full lg:w-auto"
                            variant="secondary"
                            onClick={() =>
                                run("Demo leads", () => api.demoLeads())
                            }
                        >
                            Load Demo Leads
                        </Button>
                        <label className="inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-moss/30 bg-white px-4 text-sm font-semibold text-ink hover:bg-mint/40 lg:w-auto">
                            <FileUp size={16} />
                            Upload CSV
                            <input
                                hidden
                                type="file"
                                accept=".csv"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    e.target.value = "";
                                    if (!file) return;
                                    void run("CSV import", async () => {
                                        const result = await api.importCsv(file);
                                        if (selectedIcpId)
                                            await api.analyze(selectedIcpId);
                                        return result;
                                    });
                                }}
                            />
                        </label>
                        <Button
                            className="w-full lg:w-auto"
                            disabled={!selectedIcpId}
                            onClick={() =>
                                run("Analysis", () =>
                                    api.analyze(selectedIcpId),
                                )
                            }
                        >
                            <BarChart3 size={16} />
                            Analyze Leads
                        </Button>
                    </div>
                </div>
            </header>

            <div className="mx-auto grid max-w-7xl gap-5 px-4 py-5 sm:px-5">
                {toast && (
                    <div className="rounded-md border border-moss/20 bg-mint/60 px-4 py-3 text-sm font-medium">
                        {toast}
                    </div>
                )}
                <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    {[
                        ["Total Leads", stats.totalLeads ?? 0],
                        ["High Priority", stats.highPriority ?? 0],
                        ["Average Score", stats.averageScore ?? 0],
                        ["Contactable", stats.contactableLeads ?? 0],
                    ].map(([label, value]) => (
                        <Card key={label as string}>
                            <p className="text-xs text-stone-500 sm:text-sm">
                                {label}
                            </p>
                            <strong className="text-2xl sm:text-3xl">
                                {value}
                            </strong>
                        </Card>
                    ))}
                </section>

                <section className="grid min-w-0 gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
                    <div className="min-w-0 space-y-5">
                        <Card>
                            <h2 className="mb-3 font-semibold">ICP Builder</h2>
                            <Dropdown
                                value={selectedIcpId}
                                onChange={setSelectedIcpId}
                                className="w-full"
                                placeholder="Select ICP"
                                options={icps.map((icp) => ({
                                    value: icp.id,
                                    label: icp.name,
                                }))}
                            />
                            <ICPForm
                                onSave={async (icp) => {
                                    const created = await api.createIcp(icp);
                                    setSelectedIcpId(created.id);
                                    await refreshIcps();
                                    setToast("ICP created");
                                }}
                            />
                            {selectedIcp && (
                                <div className="mt-3 space-y-2 text-sm text-stone-700">
                                    <p>
                                        <strong>{selectedIcp.industry}</strong>{" "}
                                        in {selectedIcp.locations.join(", ")}
                                    </p>
                                    <p>
                                        {selectedIcp.minEmployees}-
                                        {selectedIcp.maxEmployees} employees •{" "}
                                        {money(selectedIcp.minRevenue)}-
                                        {money(selectedIcp.maxRevenue)}
                                    </p>
                                    <p>
                                        Titles:{" "}
                                        {selectedIcp.targetTitles.join(", ")}
                                    </p>
                                </div>
                            )}
                        </Card>
                        <Card>
                            <h2 className="mb-3 flex items-center gap-2 font-semibold">
                                <Filter size={16} />
                                Smart Filters
                            </h2>
                            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
                                {smartFilters.map(([label, patch, Icon]) => {
                                    const isActive = Object.entries(
                                        patch,
                                    ).every(([key, value]) => (filters as Record<string, string>)[key] === value);
                                    return (
                                        <Button
                                            key={label}
                                            variant="secondary"
                                            active={isActive}
                                            onClick={() => {
                                                setPage(1);
                                                setFilters({
                                                    ...filters,
                                                    ...patch,
                                                });
                                            }}
                                        >
                                            <Icon size={16} />
                                            {label}
                                        </Button>
                                    );
                                })}
                                <Button
                                    variant="ghost"
                                    onClick={() =>
                                        setFilters({
                                            search: "",
                                            minScore: "",
                                            sort: "score",
                                            email: "",
                                            decisionMaker: "",
                                            growth: "",
                                        })
                                    }
                                >
                                    Clear Filters
                                </Button>
                            </div>
                        </Card>
                    </div>

                    <Card>
                        <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                            <div className="min-w-0">
                                <h2 className="text-xl font-bold">
                                    Top Opportunities
                                </h2>
                                <p className="text-sm text-stone-500">
                                    {total} ranked leads
                                </p>
                            </div>
                            <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 xl:w-auto xl:grid-cols-[260px_110px_170px_auto]">
                                <div className="relative min-w-0">
                                    <Search
                                        className="absolute left-3 top-3 text-stone-400"
                                        size={16}
                                    />
                                    <Input
                                        className="w-full pl-9"
                                        placeholder="Search company or domain"
                                        value={filters.search}
                                        onChange={(e) => {
                                            setPage(1);
                                            setFilters({
                                                ...filters,
                                                search: e.target.value,
                                            });
                                        }}
                                    />
                                </div>
                                <Input
                                    className="w-full"
                                    placeholder="Min score"
                                    value={filters.minScore}
                                    onChange={(e) =>
                                        setFilters({
                                            ...filters,
                                            minScore: e.target.value,
                                        })
                                    }
                                />
                                <Dropdown
                                    className="w-full"
                                    value={filters.sort}
                                    onChange={(value) =>
                                        setFilters({
                                            ...filters,
                                            sort: value,
                                        })
                                    }
                                    options={[
                                        { value: "score", label: "Highest score" },
                                        { value: "scoreAsc", label: "Lowest score" },
                                        { value: "revenue", label: "Revenue" },
                                        { value: "employees", label: "Employees" },
                                        { value: "dataQuality", label: "Data quality" },
                                        { value: "contactability", label: "Contactability" },
                                    ]}
                                />
                                <Button
                                    className="w-full"
                                    variant="secondary"
                                    onClick={() =>
                                        window.open(
                                            api.exportUrl(params),
                                            "_blank",
                                        )
                                    }
                                >
                                    <Download size={16} />
                                    Export
                                </Button>
                            </div>
                        </div>
                        <div className="grid gap-3 lg:hidden">
                            {loading && leads.length === 0 && (
                                <div className="rounded-lg border border-black/10 bg-white p-6 text-center text-sm text-stone-500">
                                    Loading leads...
                                </div>
                            )}
                            {(!loading || leads.length > 0) &&
                                leads.map((lead, index) => (
                                    <LeadCard
                                        key={lead.id}
                                        lead={lead}
                                        rank={(page - 1) * 15 + index + 1}
                                        onOpen={() => setSelectedLead(lead)}
                                    />
                                ))}
                        </div>
                        <div className="hidden overflow-x-auto lg:block">
                            <table className="w-full min-w-[920px] border-collapse text-sm">
                                <thead>
                                    <tr className="border-b text-left text-stone-500">
                                        {[
                                            "Rank",
                                            "Company",
                                            "Score",
                                            "Industry",
                                            "Location",
                                            "Employees",
                                            "Revenue",
                                            "Decision Maker",
                                            "Contact",
                                            "Action",
                                        ].map((h) => (
                                            <th
                                                key={h}
                                                className="py-3 pr-3 font-semibold"
                                            >
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading && leads.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={10}
                                                className="py-8 text-center text-stone-500"
                                            >
                                                Loading leads...
                                            </td>
                                        </tr>
                                    )}
                                    {(!loading || leads.length > 0) &&
                                        leads.map((lead, index) => (
                                            <tr
                                                key={lead.id}
                                                className="cursor-pointer border-b hover:bg-mint/20"
                                                onClick={() =>
                                                    setSelectedLead(lead)
                                                }
                                            >
                                                <td className="py-3 pr-3 font-bold">
                                                    #
                                                    {(page - 1) * 15 +
                                                        index +
                                                        1}
                                                </td>
                                                <td className="py-3 pr-3">
                                                    <strong>
                                                        {lead.company}
                                                    </strong>
                                                    <p className="text-xs text-stone-500">
                                                        {lead.domain}
                                                    </p>
                                                </td>
                                                <td className="py-3 pr-3">
                                                    <Badge
                                                        tone={scoreTone(
                                                            lead.score
                                                                ?.totalScore,
                                                        )}
                                                    >
                                                        {lead.score
                                                            ?.totalScore ??
                                                            "N/A"}
                                                        /100
                                                    </Badge>
                                                </td>
                                                <td className="py-3 pr-3">
                                                    {lead.industry ?? "-"}
                                                </td>
                                                <td className="py-3 pr-3">
                                                    {[lead.city, lead.state]
                                                        .filter(Boolean)
                                                        .join(", ") || "-"}
                                                </td>
                                                <td className="py-3 pr-3">
                                                    {lead.employees ?? "-"}
                                                </td>
                                                <td className="py-3 pr-3">
                                                    {money(lead.revenue)}
                                                </td>
                                                <td className="py-3 pr-3">
                                                    {person(lead)}
                                                    <p className="text-xs text-stone-500">
                                                        {lead.ownerTitle}
                                                    </p>
                                                </td>
                                                <td className="py-3 pr-3">
                                                    {lead.ownerEmail
                                                        ? "Email"
                                                        : lead.ownerPhone ||
                                                            lead.companyPhone
                                                          ? "Phone"
                                                          : "Research"}
                                                </td>
                                                <td className="py-3 pr-3">
                                                    {lead.score
                                                        ?.recommendedAction ??
                                                        "Analyze first"}
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                            <Button
                                className="w-full"
                                variant="secondary"
                                disabled={page <= 1}
                                onClick={() => setPage(page - 1)}
                            >
                                Previous
                            </Button>
                            <span className="text-sm text-stone-500">
                                Page {page} of {totalPages}
                            </span>
                            <Button
                                className="w-full"
                                variant="secondary"
                                disabled={page >= totalPages}
                                onClick={() => setPage(page + 1)}
                            >
                                Next
                            </Button>
                        </div>
                    </Card>
                </section>
            </div>
            {selectedLead && (
                <LeadDetail
                    lead={selectedLead}
                    icpId={selectedIcpId}
                    onClose={() => setSelectedLead(null)}
                />
            )}
        </main>
    );
}
