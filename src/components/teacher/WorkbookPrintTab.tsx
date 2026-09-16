import React, { useState, useMemo } from 'react';
import { StorageService } from '../../services/storage';
import { CATEGORIES } from '../../data/categories';
import { VirtualCondition } from '../../types';
import {
  Printer,
  Search,
  CheckSquare,
  Square,
  Layers,
  Sparkles,
  BookOpen,
  Filter,
  CheckCircle2
} from 'lucide-react';

interface WorkbookPrintTabProps {
  onPrintWorkbook: (conditionIds: string | string[]) => void;
}

export const WorkbookPrintTab: React.FC<WorkbookPrintTabProps> = ({ onPrintWorkbook }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const allConditions = useMemo(() => StorageService.getConditions(), []);

  // Category counts
  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = { all: allConditions.length };
    CATEGORIES.forEach((cat) => {
      map[cat.id] = allConditions.filter((c) => c.category === cat.id).length;
    });
    return map;
  }, [allConditions]);

  // Filtered conditions
  const filteredConditions = useMemo(() => {
    return allConditions.filter((c) => {
      const matchCat = selectedCategory === 'all' || c.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      if (!q) return matchCat;

      const matchQuery =
        c.name.toLowerCase().includes(q) ||
        c.conditionId.toLowerCase().includes(q) ||
        c.summary.toLowerCase().includes(q) ||
        c.prescriptionMedicineName.toLowerCase().includes(q);

      return matchCat && matchQuery;
    });
  }, [allConditions, selectedCategory, searchQuery]);

  // Multi-select helpers
  const isAllFilteredSelected =
    filteredConditions.length > 0 &&
    filteredConditions.every((c) => selectedIds.includes(c.conditionId));

  const toggleSelectAllFiltered = () => {
    if (isAllFilteredSelected) {
      const filteredSet = new Set(filteredConditions.map((c) => c.conditionId));
      setSelectedIds((prev) => prev.filter((id) => !filteredSet.has(id)));
    } else {
      const newSelected = Array.from(
        new Set([...selectedIds, ...filteredConditions.map((c) => c.conditionId)])
      );
      setSelectedIds(newSelected);
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  const handlePrintSelected = () => {
    if (selectedIds.length === 0) return;
    onPrintWorkbook(selectedIds);
  };

  const handlePrintCurrentFiltered = () => {
    if (filteredConditions.length === 0) return;
    onPrintWorkbook(filteredConditions.map((c) => c.conditionId));
  };

  const handlePrintAll130 = () => {
    onPrintWorkbook(allConditions.map((c) => c.conditionId));
  };

  const getCategoryMeta = (catId: string) => {
    return CATEGORIES.find((c) => c.id === catId);
  };

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-rose-500/20 text-rose-300 font-bold text-xs px-2.5 py-1 rounded-full border border-rose-500/30 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-rose-400" />
              <span>실물 워크북 인쇄실</span>
            </span>
            <span className="text-xs text-slate-300">사회정서교육 A4/A5 맞춤 양식</span>
          </div>
          <h2 className="font-jua text-xl mt-1 tracking-tight">
            마음신호 130종 전체 워크북 인쇄소
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
            교실 서류함이나 상담실에 비치할 수 있는 130가지 마음신호 실물 워크북을
            단독 인쇄하거나 카테고리별·선택별로 일괄 인쇄할 수 있습니다.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handlePrintAll130}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-3.5 py-2 rounded-xl text-xs font-jua transition-all hover:scale-[1.02] cursor-pointer"
            title="130가지 전체 워크북 일괄 인쇄"
          >
            <Layers className="w-4 h-4 text-indigo-300" />
            <span>130종 전체 자료집 인쇄</span>
          </button>

          {selectedIds.length > 0 ? (
            <button
              onClick={handlePrintSelected}
              className="flex items-center gap-1.5 bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-xl text-xs font-jua shadow-md shadow-rose-900/50 transition-all hover:scale-[1.02] cursor-pointer animate-pulse"
            >
              <Printer className="w-4 h-4" />
              <span>선택한 {selectedIds.length}종 일괄 인쇄</span>
            </button>
          ) : (
            <button
              onClick={handlePrintCurrentFiltered}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-jua shadow-md shadow-indigo-900/50 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>현재 목록 ({filteredConditions.length}종) 인쇄</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Pills & Search Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
        {/* Search Bar & Multi-select Control Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="증상명, 코드(S-01), 처방약, 키워드 검색..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <button
              onClick={toggleSelectAllFiltered}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 border border-slate-200 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
            >
              {isAllFilteredSelected ? (
                <CheckSquare className="w-4 h-4 text-indigo-600" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
              <span>현재 목록 전체 선택</span>
            </button>

            {selectedIds.length > 0 && (
              <button
                onClick={clearSelection}
                className="text-xs text-slate-500 hover:text-rose-600 underline px-1"
              >
                선택 해제 ({selectedIds.length})
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-jua scrollbar-thin">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl transition-all shrink-0 flex items-center gap-1 cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>전체</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                selectedCategory === 'all' ? 'bg-slate-800 text-slate-200' : 'bg-slate-200 text-slate-600'
              }`}
            >
              {categoryCounts.all || 130}
            </span>
          </button>

          {CATEGORIES.map((cat) => {
            const count = categoryCounts[cat.id] || 0;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'text-white shadow-xs'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
                style={isSelected ? { backgroundColor: cat.color } : {}}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-black/20 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Condition Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredConditions.map((cond) => {
          const catMeta = getCategoryMeta(cond.category);
          const isChecked = selectedIds.includes(cond.conditionId);

          return (
            <div
              key={cond.conditionId}
              className={`relative border rounded-2xl p-4 transition-all duration-150 flex flex-col justify-between ${
                isChecked
                  ? 'border-indigo-400 bg-indigo-50/40 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-2xs'
              }`}
            >
              <div>
                {/* Card Top: Checkbox + ID + Category Badge */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleSelectOne(cond.conditionId)}
                      className="text-slate-400 hover:text-indigo-600 cursor-pointer"
                      title={isChecked ? '선택 해제' : '인쇄 목록에 추가'}
                    >
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-indigo-600" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-300" />
                      )}
                    </button>
                    <span className="font-mono font-bold text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
                      {cond.conditionId}
                    </span>
                  </div>

                  {catMeta && (
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
                      style={{
                        backgroundColor: catMeta.bgLight,
                        color: catMeta.color,
                        borderColor: catMeta.borderColor,
                        borderWidth: 1
                      }}
                    >
                      <span>{catMeta.icon}</span>
                      <span>{catMeta.name}</span>
                    </span>
                  )}
                </div>

                {/* Condition Name */}
                <h3 className="font-jua text-sm text-slate-900 leading-snug">
                  {cond.name}
                </h3>

                {/* Summary Quote */}
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  "{cond.summary}"
                </p>

                {/* Prescription Medicine Candy Badge */}
                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-rose-700 font-medium">
                  <span className="text-xs">🍬</span>
                  <span className="truncate">
                    처방 간식: <strong>{cond.prescriptionMedicineName}</strong>
                  </span>
                </div>
              </div>

              {/* Card Footer: Action */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">
                  처방 미션 {cond.prescriptionCandidates?.length || 3}가지 수록
                </span>
                <button
                  onClick={() => onPrintWorkbook(cond.conditionId)}
                  className="flex items-center gap-1 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-700 hover:text-indigo-600 px-2.5 py-1.5 rounded-xl text-xs font-jua transition-colors cursor-pointer"
                  title="이 워크북 바로 인쇄"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>단독 인쇄</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredConditions.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400">
          <Filter className="w-8 h-8 mx-auto mb-2 text-slate-300" />
          <p className="text-sm font-jua text-slate-600">검색 조건과 일치하는 마음신호 워크북이 없습니다.</p>
          <p className="text-xs text-slate-400 mt-1">다른 검색어를 입력하거나 카테고리를 '전체'로 변경해보세요.</p>
        </div>
      )}
    </div>
  );
};
