import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { 
  Edit, 
  Download, 
  CheckCircle, 
  MapPin, 
  Wifi, 
  Building, 
  Users, 
  Monitor 
} from 'lucide-react';
import { Site } from '@/types/siteTypes';

interface SiteStudyStepProps {
  site: Site;
  onSiteUpdate: (updatedSite: Site) => void;
}

const SiteStudyStep: React.FC<SiteStudyStepProps> = ({ site, onSiteUpdate }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Site Study</h2>
          <p className="text-gray-600 mt-1">Comprehensive site assessment and deployment readiness</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-1" />
            Edit Site Study
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            Export Report
          </Button>
          <Button size="sm">
            <CheckCircle className="h-4 w-4 mr-1" />
            Mark as Completed
          </Button>
        </div>
      </div>
      
      <div className="space-y-6">

        {/* Location & Delivery Information */}
        <Card className="shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="mr-2 h-5 w-5 text-green-600" />
              Location & Delivery Information
            </CardTitle>
            <CardDescription className="text-gray-600">
              Access details and delivery requirements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 border-b pb-2 mb-4">Access Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="floor">Floor</Label>
                    <Input id="floor" value={site?.siteStudy?.infrastructure?.floor || "2nd Floor"} readOnly className="bg-gray-50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="security-restrictions">Security Restrictions</Label>
                    <Input id="security-restrictions" value={site?.siteStudy?.infrastructure?.securityRestrictions || "Security pass required for all visitors"} readOnly className="bg-gray-50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lift-access">Lift Access</Label>
                    <Select value={site?.siteStudy?.infrastructure?.liftAccess || "Available"} disabled>
                      <SelectTrigger className="bg-gray-50">
                        <SelectValue />
                      </SelectTrigger>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="delivery-window">Delivery Window</Label>
                    <Input id="delivery-window" value={site?.siteStudy?.infrastructure?.deliveryWindow || "10:00 AM - 2:00 PM"} readOnly className="bg-gray-50" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* IT & Power Infrastructure */}
        <Card className="shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Wifi className="mr-2 h-5 w-5 text-purple-600" />
              IT & Power Infrastructure
            </CardTitle>
            <CardDescription className="text-gray-600">
              Network connectivity and power requirements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 border-b pb-2 mb-4">Network Infrastructure</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lan-points">LAN Points</Label>
                    <Input id="lan-points" value={site?.siteStudy?.itInfrastructure?.lanPoints?.toString() || "8"} readOnly className="bg-gray-50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bandwidth">Bandwidth</Label>
                    <Input id="bandwidth" value={site?.siteStudy?.itInfrastructure?.bandwidth || "6 Mbps"} readOnly className="bg-gray-50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wifi-available">Wi-Fi Available</Label>
                    <Select value={site?.siteStudy?.itInfrastructure?.wifiAvailable || "Yes"} disabled>
                      <SelectTrigger className="bg-gray-50">
                        <SelectValue />
                      </SelectTrigger>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="static-ip">Static IP</Label>
                    <Select value={site?.siteStudy?.itInfrastructure?.staticIp || "Provided"} disabled>
                      <SelectTrigger className="bg-gray-50">
                        <SelectValue />
                      </SelectTrigger>
                    </Select>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 border-b pb-2 mb-4">Power Infrastructure</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ups-power-pos">UPS Power (POS)</Label>
                    <Select value={site?.siteStudy?.itInfrastructure?.upsPowerPos || "Available"} disabled>
                      <SelectTrigger className="bg-gray-50">
                        <SelectValue />
                      </SelectTrigger>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ups-power-ceiling">UPS Power (Ceiling)</Label>
                    <Select value={site?.siteStudy?.itInfrastructure?.upsPowerCeiling || "Not Available"} disabled>
                      <SelectTrigger className="bg-gray-50">
                        <SelectValue />
                      </SelectTrigger>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Infrastructure Assessment */}
        <Card className="shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="mr-2 h-5 w-5 text-orange-600" />
              Infrastructure Assessment
            </CardTitle>
            <CardDescription className="text-gray-600">
              Site infrastructure and operational details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 border-b pb-2 mb-4">Location Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="site-address">Site Address</Label>
                    <Input id="site-address" value={site?.siteStudy?.infrastructure?.siteAddress || "Enter site address"} readOnly className="bg-gray-50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="site-postcode">Postcode</Label>
                    <Input id="site-postcode" value={site?.siteStudy?.infrastructure?.postcode || "CV3 4LF"} readOnly className="bg-gray-50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="site-region">Region</Label>
                    <Input id="site-region" value={site?.siteStudy?.infrastructure?.region || "West Midlands"} readOnly className="bg-gray-50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="site-country">Country</Label>
                    <Input id="site-country" value={site?.siteStudy?.infrastructure?.country || "United Kingdom"} readOnly className="bg-gray-50" />
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 border-b pb-2 mb-4">Infrastructure Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="number-of-counters">Number of Counters</Label>
                    <Input id="number-of-counters" value={site?.siteStudy?.infrastructure?.numberOfCounters?.toString() || "4"} readOnly className="bg-gray-50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="floor-plan-available">Floor Plan Available</Label>
                    <Select value={site?.siteStudy?.infrastructure?.floorPlanAvailable ? "Yes" : "No"} disabled>
                      <SelectTrigger className="bg-gray-50">
                        <SelectValue />
                      </SelectTrigger>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="meal-sessions">Meal Sessions</Label>
                    <Input id="meal-sessions" value={site?.siteStudy?.infrastructure?.mealSessions?.join(", ") || "Breakfast, Lunch, Dinner"} readOnly className="bg-gray-50" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Staff & Capacity Planning */}
        <Card className="shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5 text-indigo-600" />
              Staff & Capacity Planning
            </CardTitle>
            <CardDescription className="text-gray-600">
              Employee numbers and operational capacity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 border-b pb-2 mb-4">Staff Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="employee-strength">Employee Strength</Label>
                    <Input id="employee-strength" value={site?.siteStudy?.staffCapacity?.employeeStrength?.toString() || "Enter employee count"} readOnly className="bg-gray-50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="kitchen-staff">Kitchen Staff</Label>
                    <Input id="kitchen-staff" value={site?.siteStudy?.staffCapacity?.kitchenStaff?.toString() || "15"} readOnly className="bg-gray-50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="service-staff">Service Staff</Label>
                    <Input id="service-staff" value={site?.siteStudy?.staffCapacity?.serviceStaff?.toString() || "8"} readOnly className="bg-gray-50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="management">Management</Label>
                    <Input id="management" value={site?.siteStudy?.staffCapacity?.management?.toString() || "3"} readOnly className="bg-gray-50" />
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 border-b pb-2 mb-4">Operational Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="operating-hours">Operating Hours</Label>
                    <Input id="operating-hours" value={site?.siteStudy?.staffCapacity?.operatingHours || "7:00 AM - 6:00 PM"} readOnly className="bg-gray-50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="operating-days">Operating Days</Label>
                    <Input id="operating-days" value={site?.siteStudy?.staffCapacity?.operatingDays || "Monday - Friday"} readOnly className="bg-gray-50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expected-footfall">Expected Footfall</Label>
                    <Input id="expected-footfall" value={site?.siteStudy?.staffCapacity?.expectedFootfall?.toString() || "800"} readOnly className="bg-gray-50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="seating-capacity">Seating Capacity</Label>
                    <Input id="seating-capacity" value={site?.siteStudy?.staffCapacity?.seatingCapacity?.toString() || "300"} readOnly className="bg-gray-50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="peak-hours">Peak Hours</Label>
                    <Input id="peak-hours" value={site?.siteStudy?.staffCapacity?.peakHours || "12:00 PM - 2:00 PM"} readOnly className="bg-gray-50" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Software Scoping */}
        <Card className="shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Monitor className="mr-2 h-5 w-5 text-cyan-600" />
              Software Scoping
            </CardTitle>
            <CardDescription className="text-gray-600">
              Define software requirements and solutions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 border-b pb-2 mb-4">SmartQ Solutions</h4>
                <div className="space-y-3">
                  {[
                    { id: 'pos-system', name: 'SmartQ POS Pro', description: 'Advanced point-of-sale system with inventory management' },
                    { id: 'kiosk-software', name: 'Self-Service Kiosk Suite', description: 'Touch-screen kiosk software for customer interactions' },
                    { id: 'kitchen-display', name: 'Kitchen Display System', description: 'Real-time order management for kitchen staff' },
                    { id: 'inventory-management', name: 'Inventory Management Pro', description: 'Comprehensive inventory tracking and forecasting' },
                    { id: 'payment-gateway', name: 'Payment Gateway', description: 'Secure payment processing integration' },
                    { id: 'analytics-dashboard', name: 'Analytics Dashboard', description: 'Business intelligence and reporting platform' }
                  ].map((software) => (
                    <div key={software.id} className="flex items-start space-x-3">
                      <Checkbox
                        id={software.id}
                        checked={site?.siteStudy?.softwareScoping?.selectedSolutions?.includes(software.id)}
                        disabled
                        className="mt-1"
                      />
                      <div>
                        <Label htmlFor={software.id} className="text-sm font-medium">
                          {software.name}
                        </Label>
                        <p className="text-xs text-gray-500">{software.description}</p>
                      </div>
                    </div>
                  ))}
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
