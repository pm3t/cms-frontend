import React from 'react';
import { Button } from './Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalRecords: number;
    pageSize?: number;
    onPageSizeChange?: (size: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
    totalRecords,
    pageSize,
    onPageSizeChange
}) => {
    if (totalRecords === 0) return null;

    return (
        <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t border-gray-100 bg-gray-50 mt-2 rounded-b-xl">
            <div className="flex items-center gap-4 mb-4 sm:mb-0">
                <span className="text-sm text-gray-600">
                    Showing page <span className="font-bold text-gray-900">{currentPage}</span> of <span className="font-bold text-gray-900">{totalPages}</span> 
                    <span className="hidden sm:inline"> ({totalRecords} total records)</span>
                </span>
                
                {onPageSizeChange && (
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Show:</span>
                        <select 
                            value={pageSize === totalRecords ? 'All' : pageSize} 
                            onChange={(e) => onPageSizeChange(e.target.value === 'All' ? totalRecords : parseInt(e.target.value))}
                            className="text-xs border border-gray-200 rounded px-1 py-0.5 bg-white outline-none"
                        >
                            <option value="10">10</option>
                            <option value="25">25</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                            <option value="All">All</option>
                        </select>
                    </div>
                )}
            </div>

            <div className="flex gap-2">
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))} 
                    disabled={currentPage === 1}
                    className="h-8 px-3"
                >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                </Button>
                <div className="flex items-center gap-1">
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                        // Logic for showing pages around current page
                        let pageNum = 1;
                        if (totalPages <= 5) pageNum = i + 1;
                        else if (currentPage <= 3) pageNum = i + 1;
                        else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                        else pageNum = currentPage - 2 + i;

                        return (
                            <button
                                key={pageNum}
                                onClick={() => onPageChange(pageNum)}
                                className={`w-8 h-8 rounded text-xs font-bold transition-colors ${
                                    currentPage === pageNum 
                                    ? 'bg-primary-600 text-white shadow-sm' 
                                    : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-400'
                                }`}
                            >
                                {pageNum}
                            </button>
                        );
                    })}
                </div>
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} 
                    disabled={currentPage === totalPages}
                    className="h-8 px-3"
                >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
            </div>
        </div>
    );
};
