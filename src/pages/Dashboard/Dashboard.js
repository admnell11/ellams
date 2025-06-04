import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../AppProvider/AppProvider';
import Card from '../../components/Card';
import InputField from '../../components/InputField';
import Button from '../../components/Button';
import Alert from '../../components/Alert';
import LoadingSpinner from '../../components/LoadingSpinner';
import './Dashboard.css'; // We'll create this CSS file next

const Dashboard = () => {
  const { apiService, currentUser } = useContext(AppContext);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pendingAssignments, setPendingAssignments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const eventsResponse = await apiService.calendar.fetchEvents();
        const assignmentsResponse = await apiService.assignments.fetchAssignments();

        if (eventsResponse.success) {
          // Filter for upcoming events (e.g., within the next 7 days or future events)
          const now = new Date();
          const upcoming = eventsResponse.data
            .filter(event => new Date(event.date) >= now)
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(0, 5); // Show top 5 upcoming
          setUpcomingEvents(upcoming);
        } else {
          setError(eventsResponse.message || 'Failed to fetch events.');
        }

        if (assignmentsResponse.success) {
          // Filter for pending assignments (e.g., not yet due or recently due)
          const pending = assignmentsResponse.data
            .filter(assignment => !assignment.submitted && new Date(assignment.dueDate) >= now) // Example filter
            .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
            .slice(0, 5); // Show top 5 pending
          setPendingAssignments(pending);
        } else {
          setError(assignmentsResponse.message || 'Failed to fetch assignments.');
        }
      } catch (err) {
        setError('An unexpected error occurred while fetching dashboard data.');
        console.error(err);
      }
      setLoading(false);
    };

    fetchData();
  }, [apiService]);

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search logic - for now, just logs the term
    console.log('Searching for:', searchTerm);
    // This could filter the displayed events/assignments or navigate to a search results page
  };
  
  // Quick Actions - placeholders
  const quickActions = [
    { label: 'Add New Event', action: () => console.log('Navigate to Add Event') },
    { label: 'Create Assignment', action: () => console.log('Navigate to Create Assignment') },
    { label: 'View Full Routine', action: () => console.log('Navigate to Routine Page') },
  ];

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="dashboard-container">
      {error && <Alert message={error} type="error" isDismissible={true} onClose={() => setError(null)} />}
      
      <div className="dashboard-header">
        <h2>Welcome, {currentUser?.name || 'User'}!</h2>
        <form onSubmit={handleSearch} className="dashboard-search-form">
          <InputField
            type="text"
            placeholder="Search events or assignments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="dashboard-search-input"
          />
          <Button type="submit" variant="primary">Search</Button>
        </form>
      </div>

      <div className="dashboard-main-content">
        <Card title="Upcoming Events" className="dashboard-card">
          {upcomingEvents.length > 0 ? (
            <ul>
              {upcomingEvents.map(event => (
                <li key={event.id}>
                  <strong>{event.title}</strong> - {new Date(event.date).toLocaleDateString()}
                  {event.time && ` at ${event.time}`}
                  {event.description && <p className="event-description">{event.description}</p>}
                </li>
              ))}
            </ul>
          ) : (
            <p>No upcoming events.</p>
          )}
        </Card>

        <Card title="Pending Assignments" className="dashboard-card">
          {pendingAssignments.length > 0 ? (
            <ul>
              {pendingAssignments.map(assignment => (
                <li key={assignment.id}>
                  <strong>{assignment.title}</strong> (Course: {assignment.courseName || 'N/A'})
                  <p>Due: {new Date(assignment.dueDate).toLocaleDateString()}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No pending assignments.</p>
          )}
        </Card>

        <Card title="Quick Actions" className="dashboard-card">
          <div className="quick-actions-grid">
            {quickActions.map(action => (
              <Button key={action.label} onClick={action.action} variant="secondary" className="quick-action-button">
                {action.label}
              </Button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;