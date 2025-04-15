import React from 'react';
import { Slider } from './ui/slider';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';

interface FilterControlsProps {
  resultCount: number;
  onResultCountChange: (count: number) => void;
  similarityThreshold: number;
  onSimilarityThresholdChange: (threshold: number) => void;
}

const FilterControls: React.FC<FilterControlsProps> = ({
  resultCount,
  onResultCountChange,
  similarityThreshold,
  onSimilarityThresholdChange
}) => {
  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div>
          <Label htmlFor="resultCount">Results per page</Label>
          <div className="flex gap-2 items-center">
            <Slider
              id="resultCount"
              min={1}
              max={50}
              step={1}
              value={[resultCount]}
              onValueChange={(value) => onResultCountChange(value[0])}
              className="flex-1"
            />
            <Input 
              id="resultCount-input"
              type="number" 
              value={resultCount}
              onChange={(e) => onResultCountChange(parseInt(e.target.value))}
              min={1}
              max={50}
              className="w-16"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="similarityThreshold">Similarity Threshold</Label>
          <div className="flex gap-2 items-center">
            <Slider
              id="similarityThreshold"
              min={0}
              max={1}
              step={0.1}
              value={[similarityThreshold]}
              onValueChange={(value) => onSimilarityThresholdChange(value[0])}
              className="flex-1"
            />
            <Input 
              id="similarityThreshold-input"
              type="number"
              value={similarityThreshold}
              onChange={(e) => onSimilarityThresholdChange(parseFloat(e.target.value))}
              min={0}
              max={1}
              step={0.1}
              className="w-16"
            />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default FilterControls;
