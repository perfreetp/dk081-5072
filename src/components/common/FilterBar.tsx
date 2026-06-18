import { useState } from 'react';
import {
  Search,
  RotateCcw,
  Filter,
  ChevronDown,
  SlidersHorizontal,
} from 'lucide-react';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterConfig {
  key: string;
  label: string;
  options: FilterOption[];
  placeholder?: string;
}

interface FilterBarProps {
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onSearch?: () => void;
  filters?: FilterConfig[];
  filterValues?: Record<string, string>;
  onFilterChange?: (key: string, value: string) => void;
  onReset?: () => void;
  showAdvancedToggle?: boolean;
  extraActions?: React.ReactNode;
}

export default function FilterBar({
  searchPlaceholder = '搜索...',
  searchValue = '',
  onSearchChange,
  onSearch,
  filters = [],
  filterValues = {},
  onFilterChange,
  onReset,
  showAdvancedToggle = false,
  extraActions,
}: FilterBarProps) {
  const [localSearch, setLocalSearch] = useState(searchValue);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearch(value);
    onSearchChange?.(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch?.();
    }
  };

  const handleReset = () => {
    setLocalSearch('');
    onReset?.();
  };

  const toggleDropdown = (key: string) => {
    setOpenDropdown(openDropdown === key ? null : key);
  };

  const selectOption = (key: string, value: string) => {
    onFilterChange?.(key, value);
    setOpenDropdown(null);
  };

  const getSelectedLabel = (filter: FilterConfig): string => {
    const value = filterValues[filter.key];
    if (!value) return filter.placeholder || `全部${filter.label}`;
    const option = filter.options.find((o) => o.value === value);
    return option?.label || filter.placeholder || `全部${filter.label}`;
  };

  const hasActiveFilters =
    localSearch !== '' || Object.values(filterValues).some((v) => v !== '');

  return (
    <div className="card p-4 space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[240px] max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={localSearch}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              placeholder={searchPlaceholder}
              className="input pl-10 pr-20"
            />
            {onSearch && (
              <button
                onClick={onSearch}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 rounded-md bg-brand-orange text-white text-xs font-medium hover:bg-brand-orange-dark transition-colors"
              >
                搜索
              </button>
            )}
          </div>
        </div>

        {filters.slice(0, 3).map((filter) => (
          <div key={filter.key} className="relative">
            <button
              onClick={() => toggleDropdown(filter.key)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border text-sm font-medium transition-colors ${
                filterValues[filter.key]
                  ? 'border-brand-orange/30 bg-brand-orange/5 text-brand-orange-dark'
                  : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300'
              }`}
            >
              <Filter className="w-4 h-4 shrink-0 opacity-70" />
              <span className="max-w-[120px] truncate">{getSelectedLabel(filter)}</span>
              <ChevronDown
                className={`w-4 h-4 shrink-0 opacity-60 transition-transform ${
                  openDropdown === filter.key ? 'rotate-180' : ''
                }`}
              />
            </button>

            {openDropdown === filter.key && (
              <div className="absolute left-0 top-full mt-1.5 w-52 bg-white rounded-xl shadow-dropdown border border-neutral-100 py-1.5 z-50 animate-fade-in">
                <button
                  onClick={() => selectOption(filter.key, '')}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                    !filterValues[filter.key]
                      ? 'bg-brand-orange/10 text-brand-orange-dark font-medium'
                      : 'text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  {filter.placeholder || `全部${filter.label}`}
                </button>
                {filter.options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => selectOption(filter.key, option.value)}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                      filterValues[filter.key] === option.value
                        ? 'bg-brand-orange/10 text-brand-orange-dark font-medium'
                        : 'text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {showAdvancedToggle && filters.length > 3 && (
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border text-sm font-medium transition-colors ${
              showAdvanced
                ? 'border-brand-orange/30 bg-brand-orange/5 text-brand-orange-dark'
                : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4 shrink-0 opacity-70" />
            高级筛选
            <ChevronDown
              className={`w-4 h-4 shrink-0 opacity-60 transition-transform ${
                showAdvanced ? 'rotate-180' : ''
              }`}
            />
          </button>
        )}

        <div className="ml-auto flex items-center gap-2">
          {(hasActiveFilters || onReset) && (
            <button
              onClick={handleReset}
              className="btn-ghost"
            >
              <RotateCcw className="w-4 h-4" />
              重置
            </button>
          )}
          {extraActions}
        </div>
      </div>

      {showAdvancedToggle && showAdvanced && filters.length > 3 && (
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-neutral-100">
          {filters.slice(3).map((filter) => (
            <div key={filter.key} className="relative">
              <button
                onClick={() => toggleDropdown(filter.key)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  filterValues[filter.key]
                    ? 'border-brand-orange/30 bg-brand-orange/5 text-brand-orange-dark'
                    : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300'
                }`}
              >
                <Filter className="w-4 h-4 shrink-0 opacity-70" />
                <span className="max-w-[120px] truncate">{getSelectedLabel(filter)}</span>
                <ChevronDown
                  className={`w-4 h-4 shrink-0 opacity-60 transition-transform ${
                    openDropdown === filter.key ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {openDropdown === filter.key && (
                <div className="absolute left-0 top-full mt-1.5 w-52 bg-white rounded-xl shadow-dropdown border border-neutral-100 py-1.5 z-50 animate-fade-in">
                  <button
                    onClick={() => selectOption(filter.key, '')}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                      !filterValues[filter.key]
                        ? 'bg-brand-orange/10 text-brand-orange-dark font-medium'
                        : 'text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    {filter.placeholder || `全部${filter.label}`}
                  </button>
                  {filter.options.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => selectOption(filter.key, option.value)}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                        filterValues[filter.key] === option.value
                          ? 'bg-brand-orange/10 text-brand-orange-dark font-medium'
                          : 'text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
