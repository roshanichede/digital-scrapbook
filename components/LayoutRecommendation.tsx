// components/LayoutRecommendation.tsx
import React from 'react';
import { LayoutAnalysis, LayoutAI } from '@/lib/layoutAI';
import { Sparkles, Info, Check, X, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LayoutRecommendationProps {
  recommendation: LayoutAnalysis;
  onAccept?: () => void;
  onReject?: () => void;
  showActions?: boolean;
}

export const LayoutRecommendationCard: React.FC<LayoutRecommendationProps> = ({
  recommendation,
  onAccept,
  onReject,
  showActions = true,
}) => {
  const layoutInfo = LayoutAI.getLayoutInfo(recommendation.layout);
  
  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <Sparkles className="w-5 h-5 text-blue-500 mt-0.5" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-gray-900">{layoutInfo.name}</h3>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
              AI • {Math.round(recommendation.confidence * 100)}% confident
            </span>
          </div>
          
          <p className="text-sm text-gray-600 mb-2">
            {layoutInfo.description}
          </p>
          
          <div className="flex items-start gap-2 text-xs text-gray-500 mb-3">
            <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
            <span>{recommendation.reasoning}</span>
          </div>
          
          <div className="text-xs text-gray-400">
            <span className="font-medium">Best for:</span> {layoutInfo.bestFor}
            <span className="mx-2">•</span>
            <span className="font-medium">Style:</span> {layoutInfo.style}
          </div>
        </div>
      </div>
      
      {showActions && (
        <div className="mt-4 flex gap-2">
          <Button
            onClick={onAccept}
            className="flex-1 bg-blue-500 text-white text-sm py-2 px-4 rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            Use This Layout
          </Button>
          <Button
            onClick={onReject}
            variant="outline"
            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
};

interface LayoutRecommendationSectionProps {
  isLoading: boolean;
  error: string | null;
  recommendation: LayoutAnalysis | null;
  selectedLayout: string | null;
  onGetRecommendation: () => void;
  onAcceptRecommendation: () => void;
  onRejectRecommendation: () => void;
  onChangeLayout: () => void;
  canGetRecommendation: boolean;
  imageCount: number;
  captionLength: number;
}

export const LayoutRecommendationSection: React.FC<LayoutRecommendationSectionProps> = ({
  isLoading,
  error,
  recommendation,
  selectedLayout,
  onGetRecommendation,
  onAcceptRecommendation,
  onRejectRecommendation,
  onChangeLayout,
  canGetRecommendation,
  imageCount,
  captionLength
}) => {
  return (
    <div className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4">
      <div className="mb-4">
        <h3 className="flex items-center gap-2 text-lg font-medium text-gray-800">
          <Sparkles className="w-5 h-5 text-purple-500" />
          AI Layout Recommendation
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Get AI-powered layout suggestions optimized for your content
        </p>
      </div>

      {!recommendation && !selectedLayout && (
        <Button
          onClick={onGetRecommendation}
          disabled={!canGetRecommendation || isLoading}
          className="w-full flex items-center gap-2"
          variant="outline"
        >
          <Sparkles className="w-4 h-4" />
          Get AI Layout Recommendation
        </Button>
      )}

      {isLoading && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
          <Loader2 className="w-6 h-6 animate-spin text-purple-500 mx-auto mb-2" />
          <p className="text-gray-600 font-medium">AI is analyzing your memory...</p>
          <p className="text-sm text-gray-500 mt-1">
            Processing {imageCount} images and {captionLength} character caption
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800 mb-2">
            <AlertTriangle className="w-4 h-4" />
            <span className="font-medium">AI Recommendation Failed</span>
          </div>
          <p className="text-sm text-red-600 mb-3">{error}</p>
          <Button
            onClick={onGetRecommendation}
            variant="outline"
            size="sm"
            className="text-red-700 border-red-300 hover:bg-red-50"
          >
            Try Again
          </Button>
        </div>
      )}

      {recommendation && !selectedLayout && (
        <LayoutRecommendationCard
          recommendation={recommendation}
          onAccept={onAcceptRecommendation}
          onReject={onRejectRecommendation}
        />
      )}

      {selectedLayout && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-800 mb-2">
            <Check className="w-4 h-4" />
            <span className="font-medium">
              Layout Selected: {LayoutAI.getLayoutInfo(selectedLayout as any).name}
            </span>
          </div>
          <p className="text-sm text-green-600 mb-3">
            This layout will be applied when your memory is displayed in the digital book
          </p>
          <Button
            onClick={onChangeLayout}
            variant="ghost"
            size="sm"
            className="text-green-700 hover:text-green-800 hover:bg-green-100"
          >
            Choose Different Layout
          </Button>
        </div>
      )}
    </div>
  );
};