import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  CheckCircle, 
  ShoppingCart, 
  DollarSign, 
  Calendar, 
  Package, 
  Clock, 
  Download 
} from 'lucide-react';
import { Site } from '@/types/siteTypes';

interface ProcurementStepProps {
  site: Site;
  onSiteUpdate: (updatedSite: Site) => void;
}

const ProcurementStep: React.FC<ProcurementStepProps> = ({ site, onSiteUpdate }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Procurement</h2>
          <p className="text-gray-600 mt-1">Equipment and materials acquisition process</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Item
          </Button>
          <Button size="sm">
            <CheckCircle className="h-4 w-4 mr-1" />
            Mark Complete
          </Button>
        </div>
      </div>
      
      <div className="space-y-6">
        {/* Procurement Overview */}
        <Card className="shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShoppingCart className="mr-2 h-5 w-5 text-blue-600" />
              Procurement Status
            </CardTitle>
            <CardDescription className="text-gray-600">
              Overall progress of equipment acquisition
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 border-b pb-2 mb-4">Progress Overview</h4>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                    <div>
                      <p className="font-semibold text-blue-800">Procurement Progress</p>
                      <p className="text-sm text-blue-600">In progress - 75% complete</p>
                    </div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800 border border-blue-200">
                    {site?.procurement?.status ? site.procurement.status.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : 'In Progress'}
                  </Badge>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 border-b pb-2 mb-4">Item Status</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Total Items</span>
                    <Badge className="bg-gray-100 text-gray-800">12</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Ordered</span>
                    <Badge className="bg-green-100 text-green-800">9</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Delivered</span>
                    <Badge className="bg-blue-100 text-blue-800">6</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Pending</span>
                    <Badge className="bg-yellow-100 text-yellow-800">3</Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Budget Summary */}
        <Card className="shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="mr-2 h-5 w-5 text-green-600" />
              Budget Summary
            </CardTitle>
            <CardDescription className="text-gray-600">
              Financial overview of procurement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 border-b pb-2 mb-4">Financial Overview</h4>
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-green-800">Total Budget</span>
                    <span className="text-lg font-bold text-green-900">$45,000</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-green-800">Spent</span>
                    <span className="text-lg font-bold text-green-900">$33,750</span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-green-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-green-800">Remaining</span>
                      <span className="text-lg font-bold text-green-900">$11,250</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 border-b pb-2 mb-4">Progress Tracking</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-xs text-gray-600">Progress</span>
                    <span className="text-xs font-medium text-gray-800">75%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card className="shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-purple-600" />
              Procurement Timeline
            </CardTitle>
            <CardDescription className="text-gray-600">
              Key dates and milestones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 border-b pb-2 mb-4">Key Milestones</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-800">Procurement Started</p>
                      <p className="text-xs text-green-600">Dec 15, 2024</p>
                    </div>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-800">Orders Placed</p>
                      <p className="text-xs text-blue-600">Dec 20, 2024</p>
                    </div>
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-yellow-800">First Delivery</p>
                      <p className="text-xs text-yellow-600">Jan 5, 2025</p>
                    </div>
                    <Clock className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600">All Items Delivered</p>
                      <p className="text-xs text-gray-500">Jan 15, 2025</p>
                    </div>
                    <Clock className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Procurement Items */}
        <Card className="shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="mr-2 h-5 w-5 text-orange-600" />
              Procurement Items
            </CardTitle>
            <CardDescription className="text-gray-600">
              Detailed list of equipment and materials being procured
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 border-b pb-2 mb-4">Equipment List</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Item 1 */}
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Package className="h-5 w-5 text-green-600" />
                        <h4 className="font-semibold text-green-900">Antenna System</h4>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Delivered</Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-green-700">Quantity:</span>
                        <span className="text-green-900 font-medium">2 units</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-700">Cost:</span>
                        <span className="text-green-900 font-medium">$8,500</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-700">Supplier:</span>
                        <span className="text-green-900 font-medium">TechCorp</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-700">Delivery:</span>
                        <span className="text-green-900 font-medium">Jan 3, 2025</span>
                      </div>
                    </div>
                  </div>

                  {/* Item 2 */}
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Package className="h-5 w-5 text-blue-600" />
                        <h4 className="font-semibold text-blue-900">Power Supply Units</h4>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">Ordered</Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-blue-700">Quantity:</span>
                        <span className="text-blue-900 font-medium">4 units</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Cost:</span>
                        <span className="text-blue-900 font-medium">$6,200</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Supplier:</span>
                        <span className="text-blue-900 font-medium">PowerTech</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Delivery:</span>
                        <span className="text-blue-900 font-medium">Jan 8, 2025</span>
                      </div>
                    </div>
                  </div>

                  {/* Item 3 */}
                  <div className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Package className="h-5 w-5 text-yellow-600" />
                        <h4 className="font-semibold text-yellow-900">Cabling & Connectors</h4>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-yellow-700">Quantity:</span>
                        <span className="text-yellow-900 font-medium">1 lot</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-yellow-700">Cost:</span>
                        <span className="text-yellow-900 font-medium">$2,800</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-yellow-700">Supplier:</span>
                        <span className="text-yellow-900 font-medium">CablePro</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-yellow-700">Delivery:</span>
                        <span className="text-yellow-900 font-medium">Jan 12, 2025</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Procurement Actions */}
        <div className="flex justify-end space-x-3">
          <Button variant="outline" className="border-gray-300 hover:border-gray-400">
            <Download className="h-4 w-4 mr-2" />
            Export Procurement Report
          </Button>
          <Button variant="outline" className="border-blue-300 hover:border-blue-400">
            <Plus className="h-4 w-4 mr-2" />
            Add Procurement Item
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Update Procurement Status
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProcurementStep;
