import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const UK_CITIES = [
  "London",
  "Birmingham", 
  "Manchester",
  "Glasgow",
  "Liverpool",
  "Leeds",
  "Sheffield",
  "Edinburgh",
  "Bristol",
  "Cardiff",
  "Leicester",
  "Coventry",
  "Nottingham",
  "Bradford",
  "Belfast",
  "Kingston upon Hull",
  "Plymouth",
  "Stoke-on-Trent",
  "Wolverhampton",
  "Derby",
  "Southampton",
  "Portsmouth",
  "Newcastle upon Tyne",
  "Dundee",
  "Norwich",
  "Swansea",
  "Reading",
  "Wigan",
  "Bolton",
  "Rotherham",
  "Oldham",
  "Blackpool",
  "Stockport",
  "Preston",
  "Milton Keynes",
  "Aberdeen",
  "Sunderland",
  "York",
  "Exeter",
  "Oxford",
  "Cambridge",
  "Peterborough",
  "Bath",
  "Chester",
  "Brighton",
  "Gloucester",
  "Worcester",
  "Canterbury",
  "Salisbury"
].sort();

interface UKCitySelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

export const UKCitySelect = ({ value, onValueChange, placeholder = "Select a UK city" }: UKCitySelectProps) => {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {UK_CITIES.map((city) => (
          <SelectItem key={city} value={city}>
            {city}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};