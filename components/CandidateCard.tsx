
import React from 'react';
import { Candidate } from '../types';
import { User } from 'lucide-react';

interface CandidateCardProps {
  candidate: Candidate;
  showAdminActions?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const CandidateCard: React.FC<CandidateCardProps> = ({ 
  candidate, 
  showAdminActions, 
  onEdit, 
  onDelete 
}) => {
  const hasValidPhoto = candidate.photoUrl && candidate.photoUrl.trim().length > 0;
  const hasValidSymbol = candidate.symbolUrl && candidate.symbolUrl.trim().length > 0;

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-xl transition-all flex flex-col h-full group">
      <div className="h-64 bg-gray-100 relative overflow-hidden">
        {hasValidPhoto ? (
          <img 
            src={candidate.photoUrl} 
            alt={candidate.name} 
            className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x400?text=No+Photo';
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 bg-gray-50">
            <User size={64} />
            <span className="text-xs mt-2 font-medium">फोटो उपलब्ध छैन</span>
          </div>
        )}

        {/* Election Symbol Overlay - 1/4th portion */}
        {hasValidSymbol && (
          <div className="absolute top-2 right-2 w-20 h-20 bg-white p-1 rounded-lg shadow-lg border border-gray-200 z-10 animate-in zoom-in duration-300">
            <img 
              src={candidate.symbolUrl} 
              alt="चिन्ह" 
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-900/90 via-blue-900/40 to-transparent p-4">
            <p className="text-white text-xs font-bold uppercase tracking-wider">
                निर्वाचन क्षेत्र {candidate.constituency}
            </p>
        </div>
      </div>
      
      <div className="p-5 flex-grow">
        <h3 className="text-xl font-bold text-gray-900 mb-1 leading-tight">{candidate.name}</h3>
        <p className="text-blue-700 font-bold mb-3 flex items-center text-sm">
            <span className="w-2 h-2 bg-blue-700 rounded-full mr-2"></span>
            {candidate.party}
        </p>
        
        <div className="text-sm text-gray-600 border-t pt-3 mt-auto">
            <p className="flex justify-between items-center">
              <span className="font-medium">जिल्ला:</span> 
              <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-800 font-semibold">{candidate.districtId}</span>
            </p>
        </div>
      </div>

      {showAdminActions && (
        <div className="p-4 bg-gray-50 border-t flex space-x-2">
          <button 
            onClick={() => onEdit?.(candidate.id)}
            className="flex-1 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold py-2 rounded-lg transition shadow-sm"
          >
            सम्पादन
          </button>
          <button 
            onClick={() => onDelete?.(candidate.id)}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm font-bold py-2 rounded-lg transition shadow-sm"
          >
            हटाउनुहोस्
          </button>
        </div>
      )}
    </div>
  );
};

export default CandidateCard;
