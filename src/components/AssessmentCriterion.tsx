import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface AssessmentCriterionProps {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  weight: number;
  description: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const AssessmentCriterion: React.FC<AssessmentCriterionProps> = ({
  id,
  icon: Icon,
  title,
  weight,
  description,
  value,
  onChange,
  disabled = false,
}) => {
  const numValue = Number.parseInt(value) || 0;

  const handleSliderChange = (newValue: number[]) => {
    onChange(newValue[0].toString());
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-jewel-green";
    if (score >= 80) return "text-jewel-blue";
    if (score >= 70) return "text-jewel-purple";
    if (score >= 60) return "text-jewel-yellow";
    return "text-red-600";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Sangat Baik";
    if (score >= 80) return "Baik";
    if (score >= 70) return "Cukup baik";
    if (score >= 60) return "Tingkatkan lagi";
    if (score > 0) return "Kurang baik";
    return "";
  };

  return (
    <div className="space-y-2 mb-4 pb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
            <Icon className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <Label htmlFor={id} className="md:text-sm text-xs font-medium">
              {title}{" "}
              <span className="text-muted-foreground md:text-sm text-xs font-normal">
                ({weight}%)
              </span>
            </Label>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {value && (
            <span className={`text-xs font-medium ${getScoreColor(numValue)}`}>
              {getScoreLabel(numValue)}
            </span>
          )}
          <Input
            id={id}
            type="number"
            min={0}
            max={100}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-14 text-right [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none h-8"
            disabled={disabled}
          />
        </div>
      </div>
      <p className="md:text-sm text-xs text-muted-foreground w-3/4">
        {description}
      </p>
      <div className="relative pt-1">
        <Slider
          defaultValue={[0]}
          value={[numValue]}
          max={100}
          step={1}
          onValueChange={handleSliderChange}
          disabled={disabled}
          className="[&_.sliderTrack]:h-2 [&_.sliderTrack]:bg-emerald-100 [&_.sliderRange]:bg-emerald-500 [&_.sliderThumb]:h-4 [&_.sliderThumb]:w-4 [&_.sliderThumb]:border-2 [&_.sliderThumb]:border-emerald-500"
        />
        <div className="flex justify-between mt-1 px-1">
          <span className="text-xs text-muted-foreground">0</span>
          <span className="text-xs text-muted-foreground">25</span>
          <span className="text-xs text-muted-foreground">50</span>
          <span className="text-xs text-muted-foreground">75</span>
          <span className="text-xs text-muted-foreground">100</span>
        </div>
      </div>
    </div>
  );
};

export default AssessmentCriterion;
