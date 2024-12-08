import React, { useState, useEffect, useMemo } from 'react';
import { Chart } from "react-google-charts";
import axios from 'axios';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  Chip,
  Rating,
  styled,
  Tooltip as MUITooltip,
  CircularProgress,
  Divider
} from '@mui/material';
import { Star, StarBorder, CalendarMonth, TrendingUp, MonetizationOn } from '@mui/icons-material';

// Custom styled components with enhanced styling
const DashboardPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 15px 30px rgba(0,0,0,0.15)'
  }
}));

const StatCard = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  background: 'linear-gradient(145deg, #f0f4f8 0%, #e6eaf0 100%)',
  boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
  transition: 'transform 0.2s ease',
  '&:hover': {
    transform: 'scale(1.03)'
  }
}));

const EnhancedOrderCard = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.spacing(2),
  padding: theme.spacing(2.5),
  border: `1px solid ${theme.palette.divider}`,
  transition: 'all 0.3s ease',
  boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
    borderColor: theme.palette.primary.main
  }
}));

export default function EnhancedOrderDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/orders/?provider_id=95261318-665e-438f-9879-fe515d0fba6d');
        setOrders(response.data);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const calculatedStats = useMemo(() => {
    if (orders.length === 0) return {
      subservicePieData: [['Subservice', 'Total Amount']],
      statusDistribution: [['Status', 'Count']],
      totalRevenue: 0,
      totalOrders: 0,
      monthOnMonthGrowth: 'N/A',
      monthlyEarningsData: [['Month', 'Earnings']]
    };
  
    // Subservice Analysis
    const subserviceAnalysis = orders.reduce((acc, order) => {
      order.items.forEach(item => {
        const subservice = item.sub_service_name;
        acc[subservice] = acc[subservice] || { count: 0, amount: 0 };
        acc[subservice].count += 1;
        acc[subservice].amount += parseFloat(item.price);
      });
      return acc;
    }, {});
  
    // Subservice Pie Chart Data
    const subservicePieData = [
      ['Subservice', 'Total Amount'],
      ...Object.entries(subserviceAnalysis).map(([name, data]) => [
        name,
        data.amount
      ])
    ];
  
    // Status Distribution
    const statusDistribution = [
      ['Status', 'Count'],
      ['Completed', orders.filter(order => order.status === 'completed').length],
      ['Cancelled', orders.filter(order => order.status === 'cancelled').length],
      ['Rejected', orders.filter(order => order.status === 'rejected').length]
    ];
  
    // Total Revenue and Orders
    const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total_price), 0);
    const totalOrders = orders.length;
  
    // Comprehensive Month-on-Month Earnings Calculation
    const currentYear = new Date().getFullYear();
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
  
    // Initialize monthly earnings for the current year
    const monthlyEarnings = {};
    monthNames.forEach((_, index) => {
      monthlyEarnings[`${currentYear}-${index}`] = 0;
    });
  
    // Calculate actual earnings for each month based on scheduled date
    orders.forEach(order => {
      const scheduledDate = new Date(order.scheduled_on);
      if (scheduledDate.getFullYear() === currentYear) {
        const key = `${currentYear}-${scheduledDate.getMonth()}`;
        monthlyEarnings[key] += parseFloat(order.total_price);
      }
    });
  
    // Convert monthly earnings to sorted array with labels
    const sortedMonthlyEarnings = monthNames.map((monthName, index) => {
      const earnings = monthlyEarnings[`${currentYear}-${index}`];
      return [`${monthName} ${currentYear}`, earnings];
    });
  
    // Prepare monthly earnings line chart data
    const monthlyEarningsData = [
      ['Month', 'Earnings'],
      ...sortedMonthlyEarnings
    ];
  
    // Improved Month-on-Month Growth Calculation
    let monthOnMonthGrowth = 'N/A';
    const validMonths = sortedMonthlyEarnings.filter(([, earnings]) => earnings > 0);
    
    if (validMonths.length > 1) {
      const currentIndex = validMonths.length - 1;
      const previousIndex = currentIndex - 1;
      
      const currentMonthEarnings = validMonths[currentIndex][1];
      const lastMonthEarnings = validMonths[previousIndex][1];
      
      // Handle zero earnings cases
      if (lastMonthEarnings > 0) {
        monthOnMonthGrowth = ((currentMonthEarnings - lastMonthEarnings) / lastMonthEarnings * 100).toFixed(2);
      } else if (currentMonthEarnings > 0) {
        monthOnMonthGrowth = 'Infinite';
      } else {
        monthOnMonthGrowth = '0';
      }
    }
  
    return {
      subservicePieData,
      statusDistribution,
      totalRevenue,
      totalOrders,
      monthOnMonthGrowth,
      monthlyEarningsData
    };
  }, [orders]);

  const chartOptions = {
    pieHole: 0.4,
    backgroundColor: 'transparent',
    legend: { position: 'bottom', textStyle: { color: '#333' } },
    chartArea: { width: '90%', height: '70%' },
    colors: ['#4285F4', '#34A853', '#FBBC05', '#EA4335']
  };

  const lineChartOptions = {
    ...chartOptions,
    curveType: 'function',
    hAxis: { title: 'Month' },
    vAxis: { title: 'Earnings (₹)' }
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography variant="h6" color="error">
          Error loading orders: {error.message}
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h3" gutterBottom sx={{ mb: 4, fontWeight: 600, color: '#2c3e50', textAlign: "center" }}>
        Order Analysis Dashboard
      </Typography>

      <Grid container spacing={4}>
        {/* Overview Statistics */}
        <Grid item xs={12} md={4}>
          <DashboardPaper elevation={3}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <StatCard>
                  <CalendarMonth sx={{ fontSize: 40, color: '#4285F4', mb: 1 }} />
                  <Typography variant="h6" color="text.secondary">Total Orders</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#4285F4' }}>
                    {calculatedStats.totalOrders}
                  </Typography>
                </StatCard>
              </Grid>
              <Grid item xs={6}>
                <StatCard>
                  <Typography variant="h6" color="text.secondary">Total Revenue</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#34A853' }}>
                    ₹{calculatedStats.totalRevenue.toFixed(2)}
                  </Typography>
                </StatCard>
              </Grid>
              <Grid item xs={12}>
                <StatCard>
                  <TrendingUp sx={{ fontSize: 40, color: '#FBBC05', mb: 1 }} />
                  <Typography variant="h6" color="text.secondary">MoM Growth</Typography>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontWeight: 'bold', 
                      color: 
                        calculatedStats.monthOnMonthGrowth === 'Infinite' ? '#34A853' :
                        calculatedStats.monthOnMonthGrowth >= 0 ? '#34A853' : '#EA4335'
                    }}
                  >
                    {calculatedStats.monthOnMonthGrowth === 'Infinite' 
                      ? '∞' 
                      : `${calculatedStats.monthOnMonthGrowth}%`}
                  </Typography>
                </StatCard>
              </Grid>
            </Grid>
          </DashboardPaper>
        </Grid>

        {/* Subservice Pie Chart */}
        <Grid item xs={12} md={4}>
          <DashboardPaper elevation={3}>
            <Typography variant="h5" gutterBottom sx={{ textAlign: 'center' }}>
              Subservice Amount Analysis
            </Typography>
            <Chart
              chartType="PieChart"
              width="100%"
              height="300px"
              data={calculatedStats.subservicePieData}
              options={chartOptions}
            />
          </DashboardPaper>
        </Grid>

        {/* Order Status Distribution Chart */}
        <Grid item xs={12} md={4}>
          <DashboardPaper elevation={3}>
            <Typography variant="h5" gutterBottom sx={{ textAlign: 'center' }}>
              Order Status Distribution
            </Typography>
            <Chart
              chartType="PieChart"
              width="100%"
              height="300px"
              data={calculatedStats.statusDistribution}
              options={chartOptions}
            />
          </DashboardPaper>
        </Grid>

        {/* Monthly Earnings Line Graph */}
        <Grid item xs={12}>
          <DashboardPaper elevation={3}>
            <Typography variant="h5" gutterBottom sx={{ textAlign: 'center' }}>
              Monthly Earnings
            </Typography>
            <Chart
              chartType="LineChart"
              width="100%"
              height="400px"
              data={calculatedStats.monthlyEarningsData}
              options={lineChartOptions}
            />
          </DashboardPaper>
        </Grid>

        {/* Recent Orders with Detailed Information */}
        <Grid item xs={12}>
          <DashboardPaper elevation={3}>
            <Typography variant="h5" gutterBottom>Recent Orders</Typography>
            <Grid container spacing={3}>
              {orders.slice(0, 5).map(order => (
                <Grid item xs={12} sm={6} md={4} key={order.id}>
                  <EnhancedOrderCard>
                    {/* Order Header */}
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Chip 
                        label={order.status} 
                        color={
                          order.status === 'completed' ? 'success' : 
                          order.status === 'cancelled' ? 'error' : 'warning'
                        } 
                        size="small" 
                        variant="outlined"
                      />
                      <Typography variant="subtitle2" color="text.secondary">
                        {new Date(order.ordered_on).toLocaleDateString()}
                      </Typography>
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    {/* Subservices */}
                    <Box mb={2}>
                      <Typography variant="subtitle1" color="text.primary" gutterBottom>
                        Services Ordered
                      </Typography>
                      {order.items.map((item, index) => (
                        <Box 
                          key={index} 
                          display="flex" 
                          justifyContent="space-between" 
                          alignItems="center"
                          sx={{ 
                            py: 0.5,
                            '&:not(:last-child)': { borderBottom: '1px solid', borderColor: 'divider' }
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            {item.sub_service_name}
                          </Typography>
                          <Typography variant="body2" color="text.primary" fontWeight="bold">
                            ₹{parseFloat(item.price).toFixed(2)}
                          </Typography>
                        </Box>
                      ))}
                    </Box>

                    {/* Total Price */}
                    <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                      <Typography variant="subtitle1" color="text.primary">
                        Total Price
                      </Typography>
                      <Typography variant="h6" color="primary" fontWeight="bold">
                        ₹{parseFloat(order.total_price).toFixed(2)}
                      </Typography>
                    </Box>
                  </EnhancedOrderCard>
                </Grid>
              ))}
            </Grid>
          </DashboardPaper>
        </Grid>
      </Grid>
    </Container>
  );
}