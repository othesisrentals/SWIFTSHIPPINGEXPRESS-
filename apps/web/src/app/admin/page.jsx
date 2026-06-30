import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search, 
  Filter,
  MoreVertical,
  Package,
  Truck,
  Plane,
  Ship,
  Calendar,
  User,
  X,
  Link,
  Copy
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingConsignment, setEditingConsignment] = useState(null);
  const [newConsignment, setNewConsignment] = useState({
    trackingCode: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    originAddress: '',
    destinationAddress: '',
    serviceType: '',
    status: 'Pickup Scheduled',
    weightKg: '',
    dimensions: '',
    pickupDate: '',
    estimatedDelivery: ''
  });

  const queryClient = useQueryClient();

  // Fetch all consignments
  const { data: consignments = [], isLoading, error } = useQuery({
    queryKey: ['admin-consignments'],
    queryFn: async () => {
      const response = await fetch('/api/admin/consignments');
      if (!response.ok) {
        throw new Error('Failed to fetch consignments');
      }
      return response.json();
    }
  });

  // Safe fetch wrapper
  const safeFetch = async (url, options) => {
    const response = await fetch(url, options);
    const contentType = response.headers.get('content-type') || '';
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Request failed ${response.status}: ${errorText}`);
    }
    if (contentType.includes('application/json')) {
      return response.json();
    }
    throw new Error('Unexpected response format');
  };

  // Create consignment mutation
  const createMutation = useMutation({
    mutationFn: async (consignmentData) => {
      return safeFetch('/api/admin/consignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(consignmentData)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-consignments'] });
      setShowAddModal(false);
      resetForm();
      alert('Consignment created successfully!');
    },
    onError: (error) => {
      alert(error.message);
    }
  });

  // Update consignment mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }) => {
      const response = await fetch(`/api/admin/consignments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update consignment');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-consignments'] });
      setEditingConsignment(null);
      alert('Consignment updated successfully!');
    },
    onError: (error) => {
      alert(error.message);
    }
  });

  // Delete consignment mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const response = await fetch(`/api/admin/consignments/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete consignment');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-consignments'] });
      alert('Consignment deleted successfully!');
    },
    onError: (error) => {
      alert(error.message);
    }
  });

  const resetForm = () => {
    setNewConsignment({
      trackingCode: '',
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      originAddress: '',
      destinationAddress: '',
      serviceType: '',
      status: 'Pickup Scheduled',
      weightKg: '',
      dimensions: '',
      pickupDate: '',
      estimatedDelivery: ''
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingConsignment) {
      updateMutation.mutate({ id: editingConsignment.id, ...newConsignment });
    } else {
      createMutation.mutate(newConsignment);
    }
  };

  const handleEdit = (consignment) => {
    setEditingConsignment(consignment);
    setNewConsignment({
      trackingCode: consignment.tracking_code,
      customerName: consignment.customer_name,
      customerEmail: consignment.customer_email || '',
      customerPhone: consignment.customer_phone || '',
      originAddress: consignment.origin_address,
      destinationAddress: consignment.destination_address,
      serviceType: consignment.service_type,
      status: consignment.status,
      weightKg: consignment.weight_kg || '',
      dimensions: consignment.dimensions || '',
      pickupDate: consignment.pickup_date ? consignment.pickup_date.slice(0, 16) : '',
      estimatedDelivery: consignment.estimated_delivery ? consignment.estimated_delivery.slice(0, 16) : ''
    });
    setShowAddModal(true);
  };

  const handleDelete = (consignment) => {
    if (confirm(`Are you sure you want to delete consignment ${consignment.tracking_code}?`)) {
      deleteMutation.mutate(consignment.id);
    }
  };

  const handleCopyLink = (trackingCode) => {
    const url = `${window.location.origin}/?track=${trackingCode}`;
    navigator.clipboard.writeText(url);
    alert('Tracking link copied to clipboard!');
  };

  const filteredConsignments = consignments.filter(consignment => {
    const matchesSearch = !searchTerm || 
      consignment.tracking_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consignment.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consignment.origin_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consignment.destination_address.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || consignment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getServiceIcon = (serviceType) => {
    switch (serviceType) {
      case 'Air Freight': return Plane;
      case 'Sea Freight': return Ship;
      case 'Land Transport': return Truck;
      case 'Warehousing': return Package;
      default: return Package;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Out for Delivery': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'In Transit': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Customs': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'Pickup Scheduled': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (adminPassword === 'admin123') { // Simple hardcoded password for now
      setIsAuthenticated(true);
    } else {
      alert('Incorrect password');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Login</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Enter the admin password to continue</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
            >
              Login
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage consignments and shipments
              </p>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                resetForm();
                setEditingConsignment(null);
                setShowAddModal(true);
              }}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>Add Consignment</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by tracking code, customer, or address..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Statuses</option>
                <option value="Pickup Scheduled">Pickup Scheduled</option>
                <option value="In Transit">In Transit</option>
                <option value="Customs">Customs</option>
                <option value="Out for Delivery">Out for Delivery</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Consignments Table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading consignments...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <Package size={48} className="mx-auto mb-4 text-red-500 opacity-50" />
              <p className="text-red-600 dark:text-red-400">Failed to load consignments</p>
            </div>
          ) : filteredConsignments.length === 0 ? (
            <div className="p-12 text-center">
              <Package size={48} className="mx-auto mb-4 text-gray-400 opacity-50" />
              <p className="text-gray-600 dark:text-gray-400">No consignments found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Tracking Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Route
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredConsignments.map((consignment) => {
                    const ServiceIcon = getServiceIcon(consignment.service_type);
                    return (
                      <motion.tr
                        key={consignment.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {consignment.tracking_code}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-3">
                              <User size={16} className="text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {consignment.customer_name}
                              </div>
                              {consignment.customer_email && (
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {consignment.customer_email}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <ServiceIcon size={16} className="text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900 dark:text-white">
                              {consignment.service_type}
                            </span>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 dark:text-white">
                            <div className="truncate max-w-xs">
                              From: {consignment.origin_address}
                            </div>
                            <div className="truncate max-w-xs text-gray-500 dark:text-gray-400">
                              To: {consignment.destination_address}
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(consignment.status)}`}>
                            {consignment.status}
                          </span>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {new Date(consignment.created_at).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(consignment.created_at).toLocaleTimeString()}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleEdit(consignment)}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                              title="Edit"
                            >
                              <Edit size={16} />
                            </motion.button>
                            
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleCopyLink(consignment.tracking_code)}
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 ml-2"
                              title="Copy Link"
                            >
                              <Link size={16} />
                            </motion.button>
                            
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDelete(consignment)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 ml-2"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowAddModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {editingConsignment ? 'Edit Consignment' : 'Add New Consignment'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tracking Code *
                  </label>
                  <input
                    type="text"
                    value={newConsignment.trackingCode}
                    onChange={(e) => setNewConsignment({...newConsignment, trackingCode: e.target.value.toUpperCase()})}
                    placeholder="SWE001234"
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    value={newConsignment.customerName}
                    onChange={(e) => setNewConsignment({...newConsignment, customerName: e.target.value})}
                    placeholder="John Doe"
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Customer Email
                  </label>
                  <input
                    type="email"
                    value={newConsignment.customerEmail}
                    onChange={(e) => setNewConsignment({...newConsignment, customerEmail: e.target.value})}
                    placeholder="john@example.com"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Customer Phone
                  </label>
                  <input
                    type="tel"
                    value={newConsignment.customerPhone}
                    onChange={(e) => setNewConsignment({...newConsignment, customerPhone: e.target.value})}
                    placeholder="+1 (555) 123-4567"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Origin Address *
                </label>
                <input
                  type="text"
                  value={newConsignment.originAddress}
                  onChange={(e) => setNewConsignment({...newConsignment, originAddress: e.target.value})}
                  placeholder="123 Main St, New York, NY 10001, USA"
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Destination Address *
                </label>
                <input
                  type="text"
                  value={newConsignment.destinationAddress}
                  onChange={(e) => setNewConsignment({...newConsignment, destinationAddress: e.target.value})}
                  placeholder="456 Oak Ave, London, UK E14 5RE"
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Service Type *
                  </label>
                  <select
                    value={newConsignment.serviceType}
                    onChange={(e) => setNewConsignment({...newConsignment, serviceType: e.target.value})}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="">Select Service Type</option>
                    <option value="Air Freight">Air Freight</option>
                    <option value="Sea Freight">Sea Freight</option>
                    <option value="Land Transport">Land Transport</option>
                    <option value="Warehousing">Warehousing</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    value={newConsignment.status}
                    onChange={(e) => setNewConsignment({...newConsignment, status: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="Pickup Scheduled">Pickup Scheduled</option>
                    <option value="In Transit">In Transit</option>
                    <option value="Customs">Customs</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newConsignment.weightKg}
                    onChange={(e) => setNewConsignment({...newConsignment, weightKg: e.target.value})}
                    placeholder="25.5"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Dimensions
                  </label>
                  <input
                    type="text"
                    value={newConsignment.dimensions}
                    onChange={(e) => setNewConsignment({...newConsignment, dimensions: e.target.value})}
                    placeholder="50x40x30 cm"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Pickup Date
                  </label>
                  <input
                    type="datetime-local"
                    value={newConsignment.pickupDate}
                    onChange={(e) => setNewConsignment({...newConsignment, pickupDate: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Estimated Delivery
                  </label>
                  <input
                    type="datetime-local"
                    value={newConsignment.estimatedDelivery}
                    onChange={(e) => setNewConsignment({...newConsignment, estimatedDelivery: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-4 pt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300"
                >
                  Cancel
                </button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={createMutation.isLoading || updateMutation.isLoading}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
                >
                  {(createMutation.isLoading || updateMutation.isLoading) 
                    ? (editingConsignment ? 'Updating...' : 'Creating...') 
                    : (editingConsignment ? 'Update Consignment' : 'Create Consignment')
                  }
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}