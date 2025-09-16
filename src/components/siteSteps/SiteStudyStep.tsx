import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Edit, 
  Download, 
  CheckCircle, 
  MapPin, 
  Wifi, 
  Building, 
  Users, 
  Monitor,
  Plus,
  Trash2,
  Calendar,
  Zap,
  Shield,
  CreditCard,
  Settings
} from 'lucide-react';
import { Site } from '@/types/siteTypes';

interface SiteStudyStepProps {
  site: Site;
  onSiteUpdate: (updatedSite: Site) => void;
}

const SiteStudyStep: React.FC<SiteStudyStepProps> = ({ site, onSiteUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(site?.siteStudy || {});

  const handleInputChange = (section: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const handleArrayChange = (section: string, field: string, index: number, value: any) => {
    setFormData(prev => {
      const currentArray = prev[section as keyof typeof prev]?.[field as keyof any] || [];
      const newArray = [...currentArray];
      newArray[index] = { ...newArray[index], ...value };
      return {
        ...prev,
        [section]: {
          ...prev[section as keyof typeof prev],
          [field]: newArray
        }
      };
    });
  };

  const addArrayItem = (section: string, field: string, defaultItem: any) => {
    setFormData(prev => {
      const currentArray = prev[section as keyof typeof prev]?.[field as keyof any] || [];
      return {
        ...prev,
        [section]: {
          ...prev[section as keyof typeof prev],
          [field]: [...currentArray, defaultItem]
        }
      };
    });
  };

  const removeArrayItem = (section: string, field: string, index: number) => {
    setFormData(prev => {
      const currentArray = prev[section as keyof typeof prev]?.[field as keyof any] || [];
      const newArray = currentArray.filter((_: any, i: number) => i !== index);
      return {
        ...prev,
        [section]: {
          ...prev[section as keyof typeof prev],
          [field]: newArray
        }
      };
    });
  };

  const handleSave = () => {
    const updatedSite = {
      ...site,
      siteStudy: formData
    };
    onSiteUpdate(updatedSite);
    setIsEditing(false);
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Site Study</h2>
          <p className="text-gray-600 mt-1">Comprehensive site assessment and deployment readiness</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            <Edit className="h-4 w-4 mr-1" />
            {isEditing ? 'Cancel' : 'Edit Site Study'}
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            Export Report
          </Button>
          {isEditing && (
            <Button size="sm" onClick={handleSave}>
              <CheckCircle className="h-4 w-4 mr-1" />
              Save Changes
            </Button>
          )}
        </div>
      </div>
      
      <div className="space-y-8">
        {/* Site Details */}
        <Card className="shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Building className="mr-2 h-6 w-6 text-blue-600" />
              Site Details
            </CardTitle>
            <CardDescription className="text-gray-600">
              Basic site identification and operational information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {/* Identity Subsection */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Identity</h3>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="client-name">Client / Sector / Org / Unit name *</Label>
                      <Input 
                        id="client-name" 
                        value={formData.siteDetails?.clientName || ''} 
                        onChange={(e) => handleInputChange('siteDetails', 'clientName', e.target.value)}
                        disabled={!isEditing}
                        className={!isEditing ? "bg-gray-50" : ""}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="site-address">Site Address & Postcode *</Label>
                      <Textarea 
                        id="site-address" 
                        value={formData.siteDetails?.siteAddress || ''} 
                        onChange={(e) => handleInputChange('siteDetails', 'siteAddress', e.target.value)}
                        disabled={!isEditing}
                        className={!isEditing ? "bg-gray-50" : ""}
                        rows={3}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <Label className="text-sm font-medium">Site Contact (Name, Role, Email, Phone) *</Label>
                      {isEditing && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => addArrayItem('siteDetails', 'siteContact', { name: '', role: '', email: '', phone: '' })}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Contact
                        </Button>
                      )}
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Phone</TableHead>
                          {isEditing && <TableHead>Actions</TableHead>}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(formData.siteDetails?.siteContact || []).map((contact: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Input 
                                value={contact.name || ''} 
                                onChange={(e) => handleArrayChange('siteDetails', 'siteContact', index, { name: e.target.value })}
                                disabled={!isEditing}
                                className={!isEditing ? "bg-gray-50" : ""}
                              />
                            </TableCell>
                            <TableCell>
                              <Input 
                                value={contact.role || ''} 
                                onChange={(e) => handleArrayChange('siteDetails', 'siteContact', index, { role: e.target.value })}
                                disabled={!isEditing}
                                className={!isEditing ? "bg-gray-50" : ""}
                              />
                            </TableCell>
                            <TableCell>
                              <Input 
                                value={contact.email || ''} 
                                onChange={(e) => handleArrayChange('siteDetails', 'siteContact', index, { email: e.target.value })}
                                disabled={!isEditing}
                                className={!isEditing ? "bg-gray-50" : ""}
                              />
                            </TableCell>
                            <TableCell>
                              <Input 
                                value={contact.phone || ''} 
                                onChange={(e) => handleArrayChange('siteDetails', 'siteContact', index, { phone: e.target.value })}
                                disabled={!isEditing}
                                className={!isEditing ? "bg-gray-50" : ""}
                              />
                            </TableCell>
                            {isEditing && (
                              <TableCell>
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  onClick={() => removeArrayItem('siteDetails', 'siteContact', index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            )}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>

              {/* Schedule Subsection */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Schedule</h3>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="target-go-live">Target Go-Live Date *</Label>
                    <Input 
                      id="target-go-live" 
                      type="date"
                      value={formData.schedule?.targetGoLiveDate || ''} 
                      onChange={(e) => handleInputChange('schedule', 'targetGoLiveDate', e.target.value)}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-gray-50" : ""}
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <Label className="text-sm font-medium">Site operating hours (Mon–Sun) *</Label>
                        <p className="text-xs text-gray-500 mt-1">Note peaks/quiet times</p>
                      </div>
                      {isEditing && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => addArrayItem('schedule', 'operatingHours', { day: '', open: '', close: '' })}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Day
                        </Button>
                      )}
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Day</TableHead>
                          <TableHead>Open</TableHead>
                          <TableHead>Close</TableHead>
                          {isEditing && <TableHead>Actions</TableHead>}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(formData.schedule?.operatingHours || []).map((hours: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Select 
                                value={hours.day || ''} 
                                onValueChange={(value) => handleArrayChange('schedule', 'operatingHours', index, { day: value })}
                                disabled={!isEditing}
                              >
                                <SelectTrigger className={!isEditing ? "bg-gray-50" : ""}>
                                  <SelectValue placeholder="Select day" />
                                </SelectTrigger>
                                <SelectContent>
                                  {daysOfWeek.map(day => (
                                    <SelectItem key={day} value={day}>{day}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Input 
                                type="time"
                                value={hours.open || ''} 
                                onChange={(e) => handleArrayChange('schedule', 'operatingHours', index, { open: e.target.value })}
                                disabled={!isEditing}
                                className={!isEditing ? "bg-gray-50" : ""}
                              />
                            </TableCell>
                            <TableCell>
                              <Input 
                                type="time"
                                value={hours.close || ''} 
                                onChange={(e) => handleArrayChange('schedule', 'operatingHours', index, { close: e.target.value })}
                                disabled={!isEditing}
                                className={!isEditing ? "bg-gray-50" : ""}
                              />
                            </TableCell>
                            {isEditing && (
                              <TableCell>
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  onClick={() => removeArrayItem('schedule', 'operatingHours', index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            )}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>

              {/* Environment Subsection */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Environment</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="space-type">Space type for kiosk / POS *</Label>
                    <Select 
                      value={formData.environment?.spaceType || ''} 
                      onValueChange={(value) => handleInputChange('environment', 'spaceType', value)}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className={!isEditing ? "bg-gray-50" : ""}>
                        <SelectValue placeholder="Select space type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Front-of-house">Front-of-house</SelectItem>
                        <SelectItem value="Back-of-house">Back-of-house</SelectItem>
                        <SelectItem value="Reception">Reception</SelectItem>
                        <SelectItem value="Cafeteria">Cafeteria</SelectItem>
                        <SelectItem value="Grab & Go">Grab & Go</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="listed-building">Is building listed or has special drilling restrictions?</Label>
                    <Select 
                      value={formData.environment?.isListedBuilding ? 'Yes' : 'No'} 
                      onValueChange={(value) => handleInputChange('environment', 'isListedBuilding', value === 'Yes')}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className={!isEditing ? "bg-gray-50" : ""}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="permit-required">Permit/Induction required to work on site?</Label>
                    <Select 
                      value={formData.environment?.permitRequired ? 'Yes' : 'No'} 
                      onValueChange={(value) => handleInputChange('environment', 'permitRequired', value === 'Yes')}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className={!isEditing ? "bg-gray-50" : ""}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Infrastructure */}
        <Card className="shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Wifi className="mr-2 h-6 w-6 text-purple-600" />
              Infrastructure
            </CardTitle>
            <CardDescription className="text-gray-600">
              Power and data infrastructure requirements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {/* Power Subsection */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Power</h3>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>Available power near proposed device locations *</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {['UK 13A socket', 'Spur', 'PoE', 'UPS', 'Other'].map((powerType) => (
                        <div key={powerType} className="flex items-center space-x-2">
                          <Checkbox
                            id={`power-${powerType}`}
                            checked={formData.powerInfrastructure?.availablePower?.includes(powerType as any) || false}
                            onCheckedChange={(checked) => {
                              const currentPower = formData.powerInfrastructure?.availablePower || [];
                              const newPower = checked 
                                ? [...currentPower, powerType]
                                : currentPower.filter(p => p !== powerType);
                              handleInputChange('powerInfrastructure', 'availablePower', newPower);
                            }}
                            disabled={!isEditing}
                          />
                          <Label htmlFor={`power-${powerType}`} className="text-sm">{powerType}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="distance-power">Distance from power to mount location (m) *</Label>
                    <Input 
                      id="distance-power" 
                      type="number"
                      value={formData.powerInfrastructure?.distanceFromPower || ''} 
                      onChange={(e) => handleInputChange('powerInfrastructure', 'distanceFromPower', Number(e.target.value))}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-gray-50" : ""}
                    />
                  </div>
                </div>
              </div>

              {/* Data Subsection */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Data</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="network-connectivity">Network connectivity preference *</Label>
                    <Select 
                      value={formData.dataInfrastructure?.networkConnectivity || ''} 
                      onValueChange={(value) => handleInputChange('dataInfrastructure', 'networkConnectivity', value)}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className={!isEditing ? "bg-gray-50" : ""}>
                        <SelectValue placeholder="Select connectivity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Ethernet">Ethernet</SelectItem>
                        <SelectItem value="Dual-band Wi‑Fi">Dual-band Wi‑Fi</SelectItem>
                        <SelectItem value="4G/5G SIM">4G/5G SIM</SelectItem>
                        <SelectItem value="Not available">Not available</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ethernet-ports">Ethernet ports available at location *</Label>
                    <Input 
                      id="ethernet-ports" 
                      type="number"
                      value={formData.dataInfrastructure?.ethernetPorts || ''} 
                      onChange={(e) => handleInputChange('dataInfrastructure', 'ethernetPorts', Number(e.target.value))}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-gray-50" : ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wifi-ssids">Wi‑Fi SSIDs for production and guest</Label>
                    <Input 
                      id="wifi-ssids" 
                      value={formData.dataInfrastructure?.wifiSSIDs || ''} 
                      onChange={(e) => handleInputChange('dataInfrastructure', 'wifiSSIDs', e.target.value)}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-gray-50" : ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vlan-ip-plan">VLAN & IP addressing plan (DHCP/Static) *</Label>
                    <Input 
                      id="vlan-ip-plan" 
                      value={formData.dataInfrastructure?.vlanIPPlan || ''} 
                      onChange={(e) => handleInputChange('dataInfrastructure', 'vlanIPPlan', e.target.value)}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-gray-50" : ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="proxy-filtering">Proxy / Web filtering in place?</Label>
                    <Select 
                      value={formData.dataInfrastructure?.proxyWebFiltering ? 'Yes' : 'No'} 
                      onValueChange={(value) => handleInputChange('dataInfrastructure', 'proxyWebFiltering', value === 'Yes')}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className={!isEditing ? "bg-gray-50" : ""}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="firewall-egress">Firewall egress allow-list possible?</Label>
                    <Select 
                      value={formData.dataInfrastructure?.firewallEgress ? 'Yes' : 'No'} 
                      onValueChange={(value) => handleInputChange('dataInfrastructure', 'firewallEgress', value === 'Yes')}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className={!isEditing ? "bg-gray-50" : ""}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mobile-signal">Is there mobile signal for SIM fallback at the install spots? *</Label>
                    <Select 
                      value={formData.dataInfrastructure?.mobileSignal || ''} 
                      onValueChange={(value) => handleInputChange('dataInfrastructure', 'mobileSignal', value)}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className={!isEditing ? "bg-gray-50" : ""}>
                        <SelectValue placeholder="Select signal quality" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Excellent">Excellent</SelectItem>
                        <SelectItem value="Good">Good</SelectItem>
                        <SelectItem value="Poor">Poor</SelectItem>
                        <SelectItem value="No signal">No signal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Physical */}
        <Card className="shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Settings className="mr-2 h-6 w-6 text-indigo-600" />
              Physical
            </CardTitle>
            <CardDescription className="text-gray-600">
              Mounting, layout, and accessibility requirements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {/* Mounting Subsection */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Mounting</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="mount-type">Mount type required for kiosks *</Label>
                    <Select 
                      value={formData.mounting?.mountType || ''} 
                      onValueChange={(value) => handleInputChange('mounting', 'mountType', value)}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className={!isEditing ? "bg-gray-50" : ""}>
                        <SelectValue placeholder="Select mount type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Wall">Wall</SelectItem>
                        <SelectItem value="Desk/Counter">Desk/Counter</SelectItem>
                        <SelectItem value="Floor-standing">Floor-standing</SelectItem>
                        <SelectItem value="Free-standing">Free-standing</SelectItem>
                        <SelectItem value="Table">Table</SelectItem>
                        <SelectItem value="To be confirmed">To be confirmed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="surface-material">Surface material & thickness *</Label>
                    <Select 
                      value={formData.mounting?.surfaceMaterial || ''} 
                      onValueChange={(value) => handleInputChange('mounting', 'surfaceMaterial', value)}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className={!isEditing ? "bg-gray-50" : ""}>
                        <SelectValue placeholder="Select material" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Drywall">Drywall</SelectItem>
                        <SelectItem value="Brick">Brick</SelectItem>
                        <SelectItem value="Concrete">Concrete</SelectItem>
                        <SelectItem value="Steel">Steel</SelectItem>
                        <SelectItem value="Wood">Wood</SelectItem>
                        <SelectItem value="Composite">Composite</SelectItem>
                        <SelectItem value="Unknown">Unknown</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="drilling-restrictions">Any drilling restrictions / RAMS needed?</Label>
                    <Select 
                      value={formData.mounting?.drillingRestrictions ? 'Yes' : 'No'} 
                      onValueChange={(value) => handleInputChange('mounting', 'drillingRestrictions', value === 'Yes')}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className={!isEditing ? "bg-gray-50" : ""}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Layout Subsection */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Layout</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div>
                      <Label htmlFor="clearance-available">Clearance available (W x D x H, cm)</Label>
                      <p className="text-xs text-gray-500 mt-1">Check door swing/aisles/ADA</p>
                    </div>
                    <Input 
                      id="clearance-available" 
                      value={formData.layout?.clearanceAvailable || ''} 
                      onChange={(e) => handleInputChange('layout', 'clearanceAvailable', e.target.value)}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-gray-50" : ""}
                      placeholder="e.g., 100 x 80 x 200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="distance-till">Distance to nearest till/printer/back-office *</Label>
                    <Input 
                      id="distance-till" 
                      type="number"
                      value={formData.layout?.distanceToTill || ''} 
                      onChange={(e) => handleInputChange('layout', 'distanceToTill', Number(e.target.value))}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-gray-50" : ""}
                    />
                  </div>
                </div>
              </div>

              {/* Accessibility Subsection */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Accessibility</h3>
                <div className="space-y-2">
                  <Label htmlFor="accessibility-compliance">Accessible height/ADA compliance needed? *</Label>
                  <Select 
                    value={formData.layout?.accessibilityCompliance ? 'Yes' : 'No'} 
                    onValueChange={(value) => handleInputChange('layout', 'accessibilityCompliance', value === 'Yes')}
                    disabled={!isEditing}
                  >
                    <SelectTrigger className={!isEditing ? "bg-gray-50" : ""}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Devices */}
        <Card className="shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Monitor className="mr-2 h-6 w-6 text-cyan-600" />
              Devices
            </CardTitle>
            <CardDescription className="text-gray-600">
              Device requirements and specifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {/* Kiosk Subsection */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Kiosk</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="kiosk-count">Number of kiosks per outlet *</Label>
                    <Input 
                      id="kiosk-count" 
                      type="number"
                      value={formData.devices?.kiosk?.numberOfKiosks || ''} 
                      onChange={(e) => handleInputChange('devices', 'kiosk', { ...formData.devices?.kiosk, numberOfKiosks: Number(e.target.value) })}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-gray-50" : ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="screen-size">Preferred screen size *</Label>
                    <Select 
                      value={formData.devices?.kiosk?.screenSize || ''} 
                      onValueChange={(value) => handleInputChange('devices', 'kiosk', { ...formData.devices?.kiosk, screenSize: value })}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className={!isEditing ? "bg-gray-50" : ""}>
                        <SelectValue placeholder="Select screen size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15&quot;">15"</SelectItem>
                        <SelectItem value="22&quot;">22"</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="card-payment-device">Card payment device (PED) type *</Label>
                    <Select 
                      value={formData.devices?.kiosk?.cardPaymentDevice || ''} 
                      onValueChange={(value) => handleInputChange('devices', 'kiosk', { ...formData.devices?.kiosk, cardPaymentDevice: value })}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className={!isEditing ? "bg-gray-50" : ""}>
                        <SelectValue placeholder="Select PED type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Verifone">Verifone</SelectItem>
                        <SelectItem value="Ingenico">Ingenico</SelectItem>
                        <SelectItem value="PAX">PAX</SelectItem>
                        <SelectItem value="Adyen">Adyen</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                        <SelectItem value="Not required">Not required</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="receipt-printer">Receipt printer required? *</Label>
                    <Select 
                      value={formData.devices?.kiosk?.receiptPrinter ? 'Yes' : 'No'} 
                      onValueChange={(value) => handleInputChange('devices', 'kiosk', { ...formData.devices?.kiosk, receiptPrinter: value === 'Yes' })}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className={!isEditing ? "bg-gray-50" : ""}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="grab-go-shelf">Grab & Go shelf or additional plate needed?</Label>
                    <Select 
                      value={formData.devices?.kiosk?.grabGoShelf ? 'Yes' : 'No'} 
                      onValueChange={(value) => handleInputChange('devices', 'kiosk', { ...formData.devices?.kiosk, grabGoShelf: value === 'Yes' })}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className={!isEditing ? "bg-gray-50" : ""}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* POS Subsection */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">POS</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pos-terminals">Number of POS terminals</Label>
                    <Input 
                      id="pos-terminals" 
                      type="number"
                      value={formData.devices?.pos?.numberOfTerminals || ''} 
                      onChange={(e) => handleInputChange('devices', 'pos', { ...formData.devices?.pos, numberOfTerminals: Number(e.target.value) })}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-gray-50" : ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cash-drawer">Cash drawer required?</Label>
                    <Select 
                      value={formData.devices?.pos?.cashDrawer ? 'Yes' : 'No'} 
                      onValueChange={(value) => handleInputChange('devices', 'pos', { ...formData.devices?.pos, cashDrawer: value === 'Yes' })}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className={!isEditing ? "bg-gray-50" : ""}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Kitchen Subsection */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Kitchen</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="kds-screens">Number of KDS screens</Label>
                    <Input 
                      id="kds-screens" 
                      type="number"
                      value={formData.devices?.kitchen?.numberOfKDSScreens || ''} 
                      onChange={(e) => handleInputChange('devices', 'kitchen', { ...formData.devices?.kitchen, numberOfKDSScreens: Number(e.target.value) })}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-gray-50" : ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="kitchen-printer">Kitchen printer required?</Label>
                    <Select 
                      value={formData.devices?.kitchen?.kitchenPrinter ? 'Yes' : 'No'} 
                      onValueChange={(value) => handleInputChange('devices', 'kitchen', { ...formData.devices?.kitchen, kitchenPrinter: value === 'Yes' })}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className={!isEditing ? "bg-gray-50" : ""}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Other Subsection */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Other</h3>
                <div className="space-y-2">
                  <Label>Scanners / NFC / Customer display requirements</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="scanners"
                        checked={formData.devices?.other?.scanners || false}
                        onCheckedChange={(checked) => handleInputChange('devices', 'other', { ...formData.devices?.other, scanners: checked })}
                        disabled={!isEditing}
                      />
                      <Label htmlFor="scanners" className="text-sm">Scanner</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="nfc"
                        checked={formData.devices?.other?.nfc || false}
                        onCheckedChange={(checked) => handleInputChange('devices', 'other', { ...formData.devices?.other, nfc: checked })}
                        disabled={!isEditing}
                      />
                      <Label htmlFor="nfc" className="text-sm">NFC</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="customer-display"
                        checked={formData.devices?.other?.customerDisplay || false}
                        onCheckedChange={(checked) => handleInputChange('devices', 'other', { ...formData.devices?.other, customerDisplay: checked })}
                        disabled={!isEditing}
                      />
                      <Label htmlFor="customer-display" className="text-sm">Customer Display</Label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Software */}
        <Card className="shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Monitor className="mr-2 h-6 w-6 text-blue-600" />
              Software
            </CardTitle>
            <CardDescription className="text-gray-600">
              Software modules, accounts, compliance, and branding
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {/* Modules Subsection */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Modules</h3>
                <div className="space-y-2">
                  <Label>Modules required *</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {['POS', 'Kiosk', 'Kitchen Display (KDS)', 'Inventory', 'Subscriptions', 'Loyalty'].map((module) => (
                      <div key={module} className="flex items-center space-x-2">
                        <Checkbox
                          id={`module-${module}`}
                          checked={formData.softwareModules?.modulesRequired?.includes(module as any) || false}
                          onCheckedChange={(checked) => {
                            const currentModules = formData.softwareModules?.modulesRequired || [];
                            const newModules = checked 
                              ? [...currentModules, module]
                              : currentModules.filter(m => m !== module);
                            handleInputChange('softwareModules', 'modulesRequired', newModules);
                          }}
                          disabled={!isEditing}
                        />
                        <Label htmlFor={`module-${module}`} className="text-sm">{module}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Accounts Subsection */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Accounts</h3>
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Label className="text-sm font-medium">User roles & counts *</Label>
                    {isEditing && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => addArrayItem('softwareModules', 'userRoles', { role: '', count: 0, notes: '' })}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Role
                      </Button>
                    )}
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Role</TableHead>
                        <TableHead>Count</TableHead>
                        <TableHead>Notes</TableHead>
                        {isEditing && <TableHead>Actions</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(formData.softwareModules?.userRoles || []).map((userRole: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Input 
                              value={userRole.role || ''} 
                              onChange={(e) => handleArrayChange('softwareModules', 'userRoles', index, { role: e.target.value })}
                              disabled={!isEditing}
                              className={!isEditing ? "bg-gray-50" : ""}
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              type="number"
                              value={userRole.count || ''} 
                              onChange={(e) => handleArrayChange('softwareModules', 'userRoles', index, { count: Number(e.target.value) })}
                              disabled={!isEditing}
                              className={!isEditing ? "bg-gray-50" : ""}
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              value={userRole.notes || ''} 
                              onChange={(e) => handleArrayChange('softwareModules', 'userRoles', index, { notes: e.target.value })}
                              disabled={!isEditing}
                              className={!isEditing ? "bg-gray-50" : ""}
                            />
                          </TableCell>
                          {isEditing && (
                            <TableCell>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => removeArrayItem('softwareModules', 'userRoles', index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Compliance Subsection */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Compliance</h3>
                <div className="space-y-2">
                  <Label htmlFor="pci-responsibilities">PCI responsibilities (SAQ type, network segmentation) *</Label>
                  <Input 
                    id="pci-responsibilities" 
                    value={formData.compliance?.pciResponsibilities || ''} 
                    onChange={(e) => handleInputChange('compliance', 'pciResponsibilities', e.target.value)}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-gray-50" : ""}
                  />
                </div>
              </div>

              {/* Branding Subsection */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Branding</h3>
                <div className="space-y-2">
                  <Label htmlFor="brand-assets">Brand assets available (logo, fonts, colour codes)?</Label>
                  <Select 
                    value={formData.compliance?.brandAssetsAvailable ? 'Yes' : 'No'} 
                    onValueChange={(value) => handleInputChange('compliance', 'brandAssetsAvailable', value === 'Yes')}
                    disabled={!isEditing}
                  >
                    <SelectTrigger className={!isEditing ? "bg-gray-50" : ""}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payments */}
        <Card className="shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <CreditCard className="mr-2 h-6 w-6 text-green-600" />
              Payments
            </CardTitle>
            <CardDescription className="text-gray-600">
              Payment gateway and PED configuration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {/* Gateway Subsection */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Gateway</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="payment-provider">Payment provider & MID/TID readiness *</Label>
                    <Input 
                      id="payment-provider" 
                      value={formData.payments?.gateway?.paymentProvider || ''} 
                      onChange={(e) => handleInputChange('payments', 'gateway', { ...formData.payments?.gateway, paymentProvider: e.target.value })}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-gray-50" : ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="p2pe-required">Is P2PE or SRED required?</Label>
                    <Select 
                      value={formData.payments?.gateway?.p2peRequired || ''} 
                      onValueChange={(value) => handleInputChange('payments', 'gateway', { ...formData.payments?.gateway, p2peRequired: value })}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className={!isEditing ? "bg-gray-50" : ""}>
                        <SelectValue placeholder="Select requirement" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Required">Required</SelectItem>
                        <SelectItem value="Preferred">Preferred</SelectItem>
                        <SelectItem value="Not required">Not required</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="settlement-currency">Settlement currency & tips/gratuity options</Label>
                    <Input 
                      id="settlement-currency" 
                      value={formData.payments?.gateway?.settlementCurrency || ''} 
                      onChange={(e) => handleInputChange('payments', 'gateway', { ...formData.payments?.gateway, settlementCurrency: e.target.value })}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-gray-50" : ""}
                    />
                  </div>
                </div>
              </div>

              {/* PED Subsection */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">PED</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ped-comms">PED comms method *</Label>
                    <Select 
                      value={formData.payments?.ped?.commsMethod || ''} 
                      onValueChange={(value) => handleInputChange('payments', 'ped', { ...formData.payments?.ped, commsMethod: value })}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className={!isEditing ? "bg-gray-50" : ""}>
                        <SelectValue placeholder="Select comms method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Ethernet">Ethernet</SelectItem>
                        <SelectItem value="Wi‑Fi">Wi‑Fi</SelectItem>
                        <SelectItem value="Bluetooth">Bluetooth</SelectItem>
                        <SelectItem value="Serial">Serial</SelectItem>
                        <SelectItem value="USB">USB</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ped-mounting">Mounting or cradle for PED *</Label>
                    <Select 
                      value={formData.payments?.ped?.mountingType || ''} 
                      onValueChange={(value) => handleInputChange('payments', 'ped', { ...formData.payments?.ped, mountingType: value })}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className={!isEditing ? "bg-gray-50" : ""}>
                        <SelectValue placeholder="Select mounting type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Integrated">Integrated</SelectItem>
                        <SelectItem value="Stanchion">Stanchion</SelectItem>
                        <SelectItem value="Counter cradle">Counter cradle</SelectItem>
                        <SelectItem value="Wall bracket">Wall bracket</SelectItem>
                        <SelectItem value="None">None</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security & HSE */}
        <Card className="shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Shield className="mr-2 h-6 w-6 text-purple-600" />
              Security & HSE
            </CardTitle>
            <CardDescription className="text-gray-600">
              Device security and health & safety requirements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {/* Device Subsection */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Device</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="mdm-required">MDM (SOTI/Intune/Other) required? *</Label>
                    <Select 
                      value={formData.securityHSE?.device?.mdmRequired || ''} 
                      onValueChange={(value) => handleInputChange('securityHSE', 'device', { ...formData.securityHSE?.device, mdmRequired: value })}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className={!isEditing ? "bg-gray-50" : ""}>
                        <SelectValue placeholder="Select MDM requirement" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SOTI">SOTI</SelectItem>
                        <SelectItem value="Intune">Intune</SelectItem>
                        <SelectItem value="Nubis">Nubis</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="asset-tagging">Asset tagging & tamper seals needed?</Label>
                    <Select 
                      value={formData.securityHSE?.device?.assetTagging ? 'Yes' : 'No'} 
                      onValueChange={(value) => handleInputChange('securityHSE', 'device', { ...formData.securityHSE?.device, assetTagging: value === 'Yes' })}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className={!isEditing ? "bg-gray-50" : ""}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* HSE Subsection */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">HSE</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="rams-approval">RAMS approval required?</Label>
                    <Select 
                      value={formData.securityHSE?.hse?.ramsApproval ? 'Yes' : 'No'} 
                      onValueChange={(value) => handleInputChange('securityHSE', 'hse', { ...formData.securityHSE?.hse, ramsApproval: value === 'Yes' })}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className={!isEditing ? "bg-gray-50" : ""}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="working-constraints">Working-at-height or out-of-hours constraints</Label>
                    <Textarea 
                      id="working-constraints" 
                      value={formData.securityHSE?.hse?.workingConstraints || ''} 
                      onChange={(e) => handleInputChange('securityHSE', 'hse', { ...formData.securityHSE?.hse, workingConstraints: e.target.value })}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-gray-50" : ""}
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        {/* Logistics */}
        <Card className="shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <MapPin className="mr-2 h-6 w-6 text-orange-600" />
              Logistics
            </CardTitle>
            <CardDescription className="text-gray-600">
              Access, staging, and on-site logistics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {/* Access Subsection */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Access</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="delivery-address">Deliver-to address & receiving window *</Label>
                    <Textarea 
                      id="delivery-address" 
                      value={formData.logistics?.access?.deliveryAddress || ''} 
                      onChange={(e) => handleInputChange('logistics', 'access', { ...formData.logistics?.access, deliveryAddress: e.target.value })}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-gray-50" : ""}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parking-access">Parking/loading bay access & height limits</Label>
                    <Textarea 
                      id="parking-access" 
                      value={formData.logistics?.access?.parkingAccess || ''} 
                      onChange={(e) => handleInputChange('logistics', 'access', { ...formData.logistics?.access, parkingAccess: e.target.value })}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-gray-50" : ""}
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Staging Subsection */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Staging</h3>
                <div className="space-y-2">
                  <Label htmlFor="delivery-preference">Preferred delivery: single-shipment vs staged</Label>
                  <Select 
                    value={formData.logistics?.staging?.deliveryPreference || ''} 
                    onValueChange={(value) => handleInputChange('logistics', 'staging', { ...formData.logistics?.staging, deliveryPreference: value })}
                    disabled={!isEditing}
                  >
                    <SelectTrigger className={!isEditing ? "bg-gray-50" : ""}>
                      <SelectValue placeholder="Select delivery preference" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Single">Single</SelectItem>
                      <SelectItem value="Staged">Staged</SelectItem>
                      <SelectItem value="On-demand">On-demand</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* On-site Subsection */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">On-site</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="induction-time">Induction time on day of install</Label>
                    <Input 
                      id="induction-time" 
                      type="time"
                      value={formData.logistics?.onSite?.inductionTime || ''} 
                      onChange={(e) => handleInputChange('logistics', 'onSite', { ...formData.logistics?.onSite, inductionTime: e.target.value })}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-gray-50" : ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="escort-required">Escort required for areas?</Label>
                    <Select 
                      value={formData.logistics?.onSite?.escortRequired ? 'Yes' : 'No'} 
                      onValueChange={(value) => handleInputChange('logistics', 'onSite', { ...formData.logistics?.onSite, escortRequired: value === 'Yes' })}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className={!isEditing ? "bg-gray-50" : ""}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pre-Install Checks */}
        <Card className="shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <CheckCircle className="mr-2 h-6 w-6 text-green-600" />
              Pre-Install Checks
            </CardTitle>
            <CardDescription className="text-gray-600">
              Network, Wi-Fi, and power verification
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {/* Network Subsection */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Network</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Ping to SmartQ endpoints from site network *</Label>
                    <div className="flex space-x-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="ping-pass"
                          checked={formData.preInstallChecks?.network?.pingPass || false}
                          onCheckedChange={(checked) => handleInputChange('preInstallChecks', 'network', { ...formData.preInstallChecks?.network, pingPass: checked })}
                          disabled={!isEditing}
                        />
                        <Label htmlFor="ping-pass" className="text-sm">Pass</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="ping-fail"
                          checked={formData.preInstallChecks?.network?.pingFail || false}
                          onCheckedChange={(checked) => handleInputChange('preInstallChecks', 'network', { ...formData.preInstallChecks?.network, pingFail: checked })}
                          disabled={!isEditing}
                        />
                        <Label htmlFor="ping-fail" className="text-sm">Fail</Label>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>HTTP/HTTPS egress allowed *</Label>
                    <div className="flex space-x-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="egress-pass"
                          checked={formData.preInstallChecks?.network?.egressPass || false}
                          onCheckedChange={(checked) => handleInputChange('preInstallChecks', 'network', { ...formData.preInstallChecks?.network, egressPass: checked })}
                          disabled={!isEditing}
                        />
                        <Label htmlFor="egress-pass" className="text-sm">Pass</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="egress-fail"
                          checked={formData.preInstallChecks?.network?.egressFail || false}
                          onCheckedChange={(checked) => handleInputChange('preInstallChecks', 'network', { ...formData.preInstallChecks?.network, egressFail: checked })}
                          disabled={!isEditing}
                        />
                        <Label htmlFor="egress-fail" className="text-sm">Fail</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Wi-Fi Subsection */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Wi‑Fi</h3>
                <div className="space-y-2">
                  <Label htmlFor="rssi-level">RSSI at install points (dBm)</Label>
                  <Input 
                    id="rssi-level" 
                    type="number"
                    value={formData.preInstallChecks?.wifi?.rssiLevel || ''} 
                    onChange={(e) => handleInputChange('preInstallChecks', 'wifi', { ...formData.preInstallChecks?.wifi, rssiLevel: Number(e.target.value) })}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-gray-50" : ""}
                  />
                </div>
              </div>

              {/* Power Subsection */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Power</h3>
                <div className="space-y-2">
                  <Label>Power outlets tested and labelled *</Label>
                  <div className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="power-pass"
                        checked={formData.preInstallChecks?.power?.powerPass || false}
                        onCheckedChange={(checked) => handleInputChange('preInstallChecks', 'power', { ...formData.preInstallChecks?.power, powerPass: checked })}
                        disabled={!isEditing}
                      />
                      <Label htmlFor="power-pass" className="text-sm">Pass</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="power-fail"
                        checked={formData.preInstallChecks?.power?.powerFail || false}
                        onCheckedChange={(checked) => handleInputChange('preInstallChecks', 'power', { ...formData.preInstallChecks?.power, powerFail: checked })}
                        disabled={!isEditing}
                      />
                      <Label htmlFor="power-fail" className="text-sm">Fail</Label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Acceptance */}
        <Card className="shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Users className="mr-2 h-6 w-6 text-indigo-600" />
              Acceptance
            </CardTitle>
            <CardDescription className="text-gray-600">
              Pilot testing and support requirements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {/* Pilot Subsection */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Pilot</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="uat-scenarios">UAT scenarios agreed *</Label>
                    <Textarea 
                      id="uat-scenarios" 
                      value={formData.acceptance?.pilot?.uatScenarios || ''} 
                      onChange={(e) => handleInputChange('acceptance', 'pilot', { ...formData.acceptance?.pilot, uatScenarios: e.target.value })}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-gray-50" : ""}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="definition-of-done">Definition of Done for Go-Live *</Label>
                    <Textarea 
                      id="definition-of-done" 
                      value={formData.acceptance?.pilot?.definitionOfDone || ''} 
                      onChange={(e) => handleInputChange('acceptance', 'pilot', { ...formData.acceptance?.pilot, definitionOfDone: e.target.value })}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-gray-50" : ""}
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Support Subsection */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Support</h3>
                <div className="space-y-2">
                  <Label htmlFor="first-week-support">First-week on-site support needed? *</Label>
                  <Select 
                    value={formData.acceptance?.support?.firstWeekSupport || ''} 
                    onValueChange={(value) => handleInputChange('acceptance', 'support', { ...formData.acceptance?.support, firstWeekSupport: value })}
                    disabled={!isEditing}
                  >
                    <SelectTrigger className={!isEditing ? "bg-gray-50" : ""}>
                      <SelectValue placeholder="Select support level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yes (days)">Yes (days)</SelectItem>
                      <SelectItem value="Remote only">Remote only</SelectItem>
                      <SelectItem value="Not required">Not required</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SiteStudyStep;
