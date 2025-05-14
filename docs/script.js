// MQTT Configuration
const MQTT_BROKER = 'wss://test.mosquitto.org:8081';
const MQTT_TOPIC = 'solar/plant/data';

// Chart Configuration
let powerChart;
const maxDataPoints = 20;
let powerData = [];
let timeLabels = [];

// Initialize MQTT Client
const client = mqtt.connect(MQTT_BROKER, {
    clientId: 'solar_dashboard_' + Math.random().toString(16).substr(2, 8),
    clean: true,
    connectTimeout: 4000,
    reconnectPeriod: 1000,
    rejectUnauthorized: false
});

// MQTT Event Handlers
client.on('connect', () => {
    console.log('Connected to MQTT broker');
    client.subscribe(MQTT_TOPIC, (err) => {
        if (!err) {
            console.log('Subscribed to topic:', MQTT_TOPIC);
        }
    });
});

client.on('message', (topic, message) => {
    try {
        const data = JSON.parse(message.toString());
        updateDashboard(data);
    } catch (error) {
        console.error('Error parsing message:', error);
    }
});

client.on('error', (error) => {
    console.error('MQTT Error:', error);
});

client.on('close', () => {
    console.log('MQTT connection closed');
});

client.on('offline', () => {
    console.log('MQTT client went offline');
});

// Initialize Chart
function initChart() {
    const ctx = document.getElementById('powerChart').getContext('2d');
    powerChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: timeLabels,
            datasets: [{
                label: 'Power Generation (W)',
                data: powerData,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Update Dashboard
function updateDashboard(data) {
    // Update power generation
    document.getElementById('power-generation').textContent = `${data.power_generation.toFixed(2)} W`;
    
    // Update efficiency
    document.getElementById('efficiency').textContent = `${data.efficiency.toFixed(2)}%`;
    
    // Update weather impact
    document.getElementById('weather-impact').textContent = `${data.weather_impact.toFixed(2)}%`;
    
    // Update status
    document.getElementById('status').textContent = data.status;
    
    // Update chart
    const now = new Date();
    const timeStr = now.toLocaleTimeString();
    
    powerData.push(data.power_generation);
    timeLabels.push(timeStr);
    
    if (powerData.length > maxDataPoints) {
        powerData.shift();
        timeLabels.shift();
    }
    
    powerChart.update();
}

// Initialize everything when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing dashboard...');
    initChart();
}); 