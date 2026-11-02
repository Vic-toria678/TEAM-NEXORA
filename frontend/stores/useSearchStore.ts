import { create } from "zustand";
import type { SearchResult } from "@/types";

interface SearchState {
  query: string;
  results: SearchResult[];
  isSearching: boolean;
  activeTab: "transcript" | "search";
  setQuery: (query: string) => void;
  setActiveTab: (activeTab: "transcript" | "search") => void;
  setResults: (results: SearchResult[]) => void;
  setSearching: (isSearching: boolean) => void;
  restoreWorkspace: (query: string, activeTab: "transcript" | "search") => void;
  clear: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  query: "",
  results: [],
  isSearching: false,
  activeTab: "transcript",
  setQuery: (query) => set({ query }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setResults: (results) => set({ results }),
  setSearching: (isSearching) => set({ isSearching }),
  restoreWorkspace: (query, activeTab) => set({ query, activeTab, results: [], isSearching: false }),
  clear: () => set({ query: "", results: [], isSearching: false, activeTab: "transcript" }),
}));
