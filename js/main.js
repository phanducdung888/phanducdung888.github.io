document.addEventListener('DOMContentLoaded', () => {
    // Initialize components
    initializeMoodChart();
    initializeChat();
    initializeScrollHandling();

    // Initialize tab navigation
    document.querySelectorAll('#tabBar .tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const screenId = this.getAttribute('onclick').match(/'([^']+)'/)[1];
            showScreen(screenId, this);
        });
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
});

// Mood Chart
function initializeMoodChart() {
    try {
        const ctx = document.getElementById('moodChart');
        if (!ctx) {
            console.error('Chart canvas element not found');
            return;
        }

        const chartContext = ctx.getContext('2d');
        if (!chartContext) {
            console.error('Could not get 2D context for chart');
            return;
        }
        
        // Set current date
        const today = new Date();
        const formattedDate = today.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        
        // Update all date elements
        document.querySelectorAll('.mood-card-header .date, .assessment-date span, .history-date .day').forEach(el => {
            if (el.classList.contains('day')) {
                el.textContent = today.getDate();
            } else if (el.classList.contains('month')) {
                el.textContent = 'Tháng ' + (today.getMonth() + 1);
            } else {
                el.textContent = formattedDate;
            }
        });

        // Remove existing chart legend if it exists
        const existingLegend = ctx.parentNode.querySelector('.chart-legend');
        if (existingLegend) {
            existingLegend.remove();
        }

        // Destroy existing chart if it exists
        if (window.moodChart instanceof Chart) {
            window.moodChart.destroy();
        }

        // Chart configuration
        const chartConfig = {
            type: 'line',
            data: {
                labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
                datasets: [
                    {
                        label: 'Stress',
                        data: [5, 6, 4, 7, 5, 6, 5],
                        borderColor: 'var(--chart-stress)',
                        backgroundColor: 'rgba(58, 179, 190, 0.1)',
                        tension: 0.4,
                        fill: true,
                        borderWidth: 2,
                        pointBackgroundColor: 'var(--chart-stress)',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6
                    },
                    {
                        label: 'Lo âu',
                        data: [4, 5, 3, 6, 4, 5, 4],
                        borderColor: 'var(--chart-anxiety)',
                        backgroundColor: 'rgba(29, 78, 216, 0.1)',
                        tension: 0.4,
                        fill: true,
                        borderWidth: 2,
                        pointBackgroundColor: 'var(--chart-anxiety)',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'var(--chart-background)',
                        titleColor: 'var(--text-color)',
                        bodyColor: 'var(--chart-text)',
                        borderColor: 'var(--chart-grid)',
                        borderWidth: 1,
                        padding: 12,
                        boxPadding: 6,
                        usePointStyle: true,
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.raw}/10`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: true,
                            color: 'var(--chart-grid)',
                            drawBorder: false
                        },
                        ticks: {
                            color: 'var(--chart-text)',
                            font: {
                                size: 12
                            }
                        }
                    },
                    y: {
                        min: 0,
                        max: 10,
                        grid: {
                            color: 'var(--chart-grid)',
                            drawBorder: false
                        },
                        ticks: {
                            color: 'var(--chart-text)',
                            font: {
                                size: 12
                            },
                            stepSize: 2
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        };

        // Create new chart
        window.moodChart = new Chart(chartContext, chartConfig);

        // Add chart legend
        const legendContainer = document.createElement('div');
        legendContainer.className = 'chart-legend';
        legendContainer.innerHTML = `
            <div class="legend-item">
                <div class="legend-color stress"></div>
                <span>Stress</span>
            </div>
            <div class="legend-item">
                <div class="legend-color anxiety"></div>
                <span>Lo âu</span>
            </div>
        `;
        ctx.parentNode.appendChild(legendContainer);

    } catch (error) {
        console.error('Error initializing mood chart:', error);
    }
}

// Screen Navigation
function showScreen(id, el) {
    // Hide all sections
    document.querySelectorAll('main section').forEach(section => {
        section.classList.add('hidden');
        section.classList.remove('fade');
    });
    
    // Show selected section
    const selected = document.getElementById(id);
    if (selected) {
        selected.classList.remove('hidden');
        requestAnimationFrame(() => selected.classList.add('fade'));
    }
    
    // Update active tab
    document.querySelectorAll('#tabBar .tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    if (el) {
        el.classList.add('active');
    }

    // Update header content
    const logo = document.querySelector('header .logo');
    const title = document.querySelector('header .header-title');
    
    if (id === 'mood') {
        logo.classList.remove('hidden');
        title.classList.add('hidden');
        // Reinitialize chart when showing mood screen
        initializeMoodChart();
    } else {
        logo.classList.add('hidden');
        title.classList.remove('hidden');
        // Update title text based on tab
        const tabTitles = {
            'chat': 'Trò chuyện với AI',
            'meditation': 'Thiền định',
            'expert': 'Kết nối chuyên gia',
            'profile': 'Hồ sơ cá nhân'
        };
        title.textContent = tabTitles[id] || 'PeaceFlow';
    }
}

// Scroll Handling
function initializeScrollHandling() {
    const header = document.querySelector('header');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll <= 0) {
            header.classList.remove('scroll-up');
            return;
        }
        
        if (currentScroll > lastScroll && !header.classList.contains('scroll-down')) {
            header.classList.remove('scroll-up');
            header.classList.add('scroll-down');
        } else if (currentScroll < lastScroll && header.classList.contains('scroll-down')) {
            header.classList.remove('scroll-down');
            header.classList.add('scroll-up');
        }
        lastScroll = currentScroll;
    });
}

// Chat Functionality
let firstMessage = true;

function initializeChat() {
    const chatBox = document.getElementById('chatBox');
    const userInput = document.getElementById('userInput');
    
    // Add welcome message
    const welcomeMessage = document.createElement('div');
    welcomeMessage.className = 'chat-message ai';
    welcomeMessage.innerHTML = `
        <div class="message-content">
            <div class="typing-indicator">
            </div>
            <p class="message-text">Xin chào! Tôi là trợ lý AI của PeaceFlow. Tôi có thể giúp gì cho bạn hôm nay?</p>
        </div>
    `;
    chatBox.appendChild(welcomeMessage);
    
    // Handle enter key
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
}

// Lịch sử hội thoại: giữ lại các tin nhắn gần nhất
const chatHistory = [
    {
      role: "system",
      content: "Bạn là PeaceFlow – một trợ lý AI chuyên tư vấn và hỗ trợ người dùng về các vấn đề tâm lý như lo âu, trầm cảm, stress, mất ngủ và cảm xúc cá nhân. Hãy lắng nghe người dùng một cách nhẹ nhàng, thấu hiểu và phản hồi như một chuyên gia trị liệu. Không chẩn đoán bệnh, chỉ hướng dẫn và đồng hành."
    }
  ];
  
  async function sendMessage() {
    const chatBox = document.getElementById('chatBox');
    const userInput = document.getElementById('userInput');
    const text = userInput.value.trim();
    if (!text) return;
  
    // Giao diện: hiển thị tin nhắn người dùng
    const userMessage = document.createElement('div');
    userMessage.className = 'chat-message user';
    userMessage.innerHTML = `<div class="message-content"><p class="message-text">${text}</p></div>`;
    chatBox.appendChild(userMessage);
    chatBox.scrollTo({ top: chatBox.scrollHeight, behavior: 'smooth' });
  
    userInput.value = '';
  
    // Giao diện: hiển thị typing indicator của AI
    const aiMessage = document.createElement('div');
    aiMessage.className = 'chat-message ai';
    aiMessage.innerHTML = `
      <div class="message-content">
        <div class="typing-indicator">
          <span></span><span></span><span></span>
        </div>
        <p class="message-text"></p>
      </div>`;
    chatBox.appendChild(aiMessage);
    chatBox.scrollTo({ top: chatBox.scrollHeight, behavior: 'smooth' });
  
    // Cập nhật lịch sử người dùng
    chatHistory.push({ role: "user", content: text });
  
    // Giữ tối đa 10 lượt user+assistant (20 phần tử), ngoài system
    const trimmedHistory = [chatHistory[0], ...chatHistory.slice(-20)];
  
    try {
      const response = await fetch('https://chat.vienchinhtech.vn/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: "deepseek-llm:7b-chat",
          messages: trimmedHistory,
          stream: true
        })
      });
  
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      const messageText = aiMessage.querySelector('.message-text');
      const typingIndicator = aiMessage.querySelector('.typing-indicator');
      let buffer = '';
      let fullResponse = '';
  
      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          if (buffer.trim()) {
            try {
              const json = JSON.parse(buffer);
              const content = json.message?.content || '';
              if (content) {
                fullResponse += content;
                messageText.textContent = fullResponse;
              }
            } catch (e) {
              console.error('Error parsing final buffer:', e);
            }
          }
          break;
        }
  
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
  
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const json = JSON.parse(line);
            if (json.error) throw new Error(json.error);
  
            const content = json.message?.content || '';
            if (content) {
              if (typingIndicator) typingIndicator.remove();
              fullResponse += content;
              messageText.textContent = fullResponse;
  
              const isNearBottom = chatBox.scrollHeight - chatBox.scrollTop - chatBox.clientHeight < 100;
              if (isNearBottom) {
                requestAnimationFrame(() => {
                  chatBox.scrollTo({ top: chatBox.scrollHeight, behavior: 'smooth' });
                });
              }
            }
          } catch (e) {
            console.error('Error parsing stream:', e);
            messageText.textContent = `Lỗi: ${e.message}`;
            messageText.classList.add('error');
          }
        }
      }
  
      // Ghi nhớ tin nhắn AI vào lịch sử
      chatHistory.push({ role: "assistant", content: fullResponse });
  
      requestAnimationFrame(() => {
        chatBox.scrollTo({ top: chatBox.scrollHeight, behavior: 'smooth' });
      });
  
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = document.createElement('div');
      errorMessage.className = 'chat-message ai error';
      errorMessage.innerHTML = `
        <div class="message-content">
          <p class="message-text">Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.</p>
        </div>`;
      chatBox.appendChild(errorMessage);
  
      requestAnimationFrame(() => {
        chatBox.scrollTo({ top: chatBox.scrollHeight, behavior: 'smooth' });
      });
    }
  }
  
// Assessment Modal
function openAssessment() {
    document.getElementById('assessmentModal').classList.remove('hidden');
}

function closeAssessment() {
    document.getElementById('assessmentModal').classList.add('hidden');
}

function submitAssessment(e) {
    e.preventDefault();
    
    const answers = {
        q1: document.querySelector('input[name="q1"]:checked')?.value,
        q2: document.querySelector('input[name="q2"]:checked')?.value,
        q3: document.querySelector('input[name="q3"]:checked')?.value
    };
    
    console.log('Assessment answers:', answers);
    alert('Cảm ơn bạn đã hoàn thành đánh giá! Chúng tôi sẽ liên hệ với bạn sớm.');
    closeAssessment();
}

// Appointment Modal
function openAppointmentModal(expertName) {
    const modal = document.getElementById('appointmentModal');
    const expertNameElement = document.getElementById('expertName');
    const dateInput = document.getElementById('appointmentDate');
    
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    
    expertNameElement.textContent = expertName;
    modal.classList.remove('hidden');
}

function closeAppointmentModal() {
    document.getElementById('appointmentModal').classList.add('hidden');
    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.classList.remove('selected');
    });
}

function selectTimeSlot(element, time) {
    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.classList.remove('selected');
    });
    
    element.classList.add('selected');
    document.getElementById('appointmentTime').value = time;
}

function submitAppointment(e) {
    e.preventDefault();
    
    const date = document.getElementById('appointmentDate').value;
    const time = document.getElementById('appointmentTime').value;
    const note = document.getElementById('appointmentNote').value;
    const expertName = document.getElementById('expertName').textContent;
    
    if (!time) {
        alert('Vui lòng chọn giờ hẹn');
        return;
    }
    
    console.log('Appointment details:', { date, time, note, expertName });
    alert('Đặt lịch thành công! Chúng tôi sẽ liên hệ với bạn để xác nhận.');
    closeAppointmentModal();
}