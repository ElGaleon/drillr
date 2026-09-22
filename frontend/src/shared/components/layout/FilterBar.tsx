import type {ReactNode} from "react";
import {MagnifyingGlass, SlidersHorizontal} from "@phosphor-icons/react";
import {Badge} from "../ui/badge";
import {Input} from "../ui/input";

export function FilterBar({searchValue, onSearchChange, searchPlaceholder = "Search…", resultCount, children}: {searchValue?: string; onSearchChange?: (value: string) => void; searchPlaceholder?: string; resultCount: number; children?: ReactNode}) {
    const hasSearch = searchValue !== undefined && onSearchChange;
    return <div className="filters-row overview-filters">{hasSearch && <div className="search-wrap"><MagnifyingGlass size={18}/><Input aria-label={searchPlaceholder} placeholder={searchPlaceholder} value={searchValue} onChange={(event) => onSearchChange(event.target.value)}/></div>}{children}<Badge>{resultCount} results</Badge></div>;
}

export function FilterBarSelect({children}: {children: ReactNode}) {
    return <div className="filter-wrap"><SlidersHorizontal size={17}/>{children}</div>;
}
