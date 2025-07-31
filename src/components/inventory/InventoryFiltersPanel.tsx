import React from 'react';
import { Filter, X, Search, MapPin, Building, Tag, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { InventoryFilters, Sector, City, Site, INVENTORY_STATUS_OPTIONS, INVENTORY_TYPE_OPTIONS, GROUP_TYPE_OPTIONS } from '@/types/inventory';

interface InventoryFiltersPanelProps {
  filters: InventoryFilters;
  onFiltersChange: (filters: InventoryFilters) => void;
  sectors: Sector[];
  cities: City[];
  sites: Site[];
}

export function InventoryFiltersPanel({
  filters,
  onFiltersChange,
  sectors,
  cities,
  sites,
}: InventoryFiltersPanelProps) {
  const updateFilter = (key: keyof InventoryFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const clearFilter = (key: keyof InventoryFilters) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  const activeFiltersCount = Object.keys(filters).length;

  return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Filter className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Filters</CardTitle>
              <p className="text-sm text-slate-600">Refine your inventory search</p>
            </div>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount} active
              </Badge>
            )}
          </div>
          {activeFiltersCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearAllFilters}
              className="text-slate-600 hover:text-slate-900"
            >
              <X className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Collapsible defaultOpen>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between hover:bg-slate-50">
              <span className="font-medium">Filter Options</span>
              <Filter className="h-4 w-4" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-6 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Search */}
              <div className="space-y-3">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Search className="h-4 w-4 text-slate-500" />
                  Search
                </label>
                <Input
                  placeholder="Search by serial number, model, manufacturer..."
                  value={filters.serial_number || filters.model || filters.manufacturer || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value) {
                      updateFilter('serial_number', value);
                      updateFilter('model', value);
                      updateFilter('manufacturer', value);
                    } else {
                      clearFilter('serial_number');
                      clearFilter('model');
                      clearFilter('manufacturer');
                    }
                  }}
                  className="shadow-sm"
                />
              </div>

              {/* Sector */}
              <div className="space-y-3">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Building className="h-4 w-4 text-slate-500" />
                  Sector
                </label>
                <Select
                  value={filters.sector_id || ''}
                  onValueChange={(value) => updateFilter('sector_id', value || undefined)}
                >
                  <SelectTrigger className="shadow-sm">
                    <SelectValue placeholder="All sectors" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All sectors</SelectItem>
                    {sectors.map((sector) => (
                      <SelectItem key={sector.id} value={sector.id}>
                        {sector.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* City */}
              <div className="space-y-3">
                <label className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-slate-500" />
                  City
                </label>
                <Select
                  value={filters.city_id || ''}
                  onValueChange={(value) => updateFilter('city_id', value || undefined)}
                >
                  <SelectTrigger className="shadow-sm">
                    <SelectValue placeholder="All cities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All cities</SelectItem>
                    {cities.map((city) => (
                      <SelectItem key={city.id} value={city.id}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Site */}
              <div className="space-y-3">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Building className="h-4 w-4 text-slate-500" />
                  Site
                </label>
                <Select
                  value={filters.site_id || ''}
                  onValueChange={(value) => updateFilter('site_id', value || undefined)}
                >
                  <SelectTrigger className="shadow-sm">
                    <SelectValue placeholder="All sites" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All sites</SelectItem>
                    {sites.map((site) => (
                      <SelectItem key={site.id} value={site.id}>
                        <div>
                          <div className="font-medium">{site.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {site.food_court_unit}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Group Type */}
              <div className="space-y-3">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Tag className="h-4 w-4 text-slate-500" />
                  Group Type
                </label>
                <Select
                  value={filters.group_type || ''}
                  onValueChange={(value) => updateFilter('group_type', value || undefined)}
                >
                  <SelectTrigger className="shadow-sm">
                    <SelectValue placeholder="All groups" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All groups</SelectItem>
                    {GROUP_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-sm text-muted-foreground">
                            {option.description}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Inventory Type */}
              <div className="space-y-3">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Tag className="h-4 w-4 text-slate-500" />
                  Inventory Type
                </label>
                <Select
                  value={filters.inventory_type || ''}
                  onValueChange={(value) => updateFilter('inventory_type', value || undefined)}
                >
                  <SelectTrigger className="shadow-sm">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All types</SelectItem>
                    {INVENTORY_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div className="space-y-3">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-500" />
                  Status
                </label>
                <Select
                  value={filters.status || ''}
                  onValueChange={(value) => updateFilter('status', value || undefined)}
                >
                  <SelectTrigger className="shadow-sm">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All statuses</SelectItem>
                    {INVENTORY_STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full bg-${option.color}-500`}></div>
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active Filters Display */}
            {activeFiltersCount > 0 && (
              <div className="pt-4 border-t border-slate-200">
                <h4 className="text-sm font-medium mb-3">Active Filters</h4>
                <div className="flex flex-wrap gap-2">
                  {filters.serial_number && (
                    <Badge variant="secondary" className="gap-1">
                      Search: {filters.serial_number}
                      <button
                        onClick={() => clearFilter('serial_number')}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {filters.sector_id && (
                    <Badge variant="secondary" className="gap-1">
                      Sector: {sectors.find(s => s.id === filters.sector_id)?.name}
                      <button
                        onClick={() => clearFilter('sector_id')}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {filters.city_id && (
                    <Badge variant="secondary" className="gap-1">
                      City: {cities.find(c => c.id === filters.city_id)?.name}
                      <button
                        onClick={() => clearFilter('city_id')}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {filters.site_id && (
                    <Badge variant="secondary" className="gap-1">
                      Site: {sites.find(s => s.id === filters.site_id)?.name}
                      <button
                        onClick={() => clearFilter('site_id')}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {filters.group_type && (
                    <Badge variant="secondary" className="gap-1">
                      Group: {GROUP_TYPE_OPTIONS.find(g => g.value === filters.group_type)?.label}
                      <button
                        onClick={() => clearFilter('group_type')}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {filters.inventory_type && (
                    <Badge variant="secondary" className="gap-1">
                      Type: {INVENTORY_TYPE_OPTIONS.find(t => t.value === filters.inventory_type)?.label}
                      <button
                        onClick={() => clearFilter('inventory_type')}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {filters.status && (
                    <Badge variant="secondary" className="gap-1">
                      Status: {INVENTORY_STATUS_OPTIONS.find(s => s.value === filters.status)?.label}
                      <button
                        onClick={() => clearFilter('status')}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
} 