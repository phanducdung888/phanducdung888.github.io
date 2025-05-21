document.addEventListener('DOMContentLoaded', () => {
    // Initialize mood chart
    initializeMoodChart();
    
    // Initialize chat
    initializeChat();

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Navbar scroll effect
    const header = document.querySelector('header');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll <= 0) {
            header.classList.remove('scroll-up');
            return;
        }
        
        if (currentScroll > lastScroll && !header.classList.contains('scroll-down')) {
            // Scroll Down
            header.classList.remove('scroll-up');
            header.classList.add('scroll-down');
        } else if (currentScroll < lastScroll && header.classList.contains('scroll-down')) {
            // Scroll Up
            header.classList.remove('scroll-down');
            header.classList.add('scroll-up');
        }
        lastScroll = currentScroll;
    });

    // Animation on scroll
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.feature-card');
        
        elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementBottom = element.getBoundingClientRect().bottom;
            
            if (elementTop < window.innerHeight && elementBottom > 0) {
                element.classList.add('animate');
            }
        });
    };

    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll(); // Initial check
});

// Mood Chart
function initializeMoodChart() {
    const ctx = document.getElementById('moodChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['11/5', '12/5', '13/5', '14/5', '15/5'],
            datasets: [
                {
                    label: 'Stress',
                    data: [4, 5, 6, 5, 6],
                    borderColor: '#3ab3be',
                    backgroundColor: '#3ab3be33',
                    tension: 0.4
                },
                {
                    label: 'Lo âu',
                    data: [3, 4, 5, 4, 5],
                    borderColor: '#1D4ED8',
                    backgroundColor: '#1D4ED833',
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: '#1e293b'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 10,
                    ticks: {
                        color: '#1e293b'
                    }
                },
                x: {
                    ticks: {
                        color: '#1e293b'
                    }
                }
            }
        }
    });
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
    selected.classList.remove('hidden');
    setTimeout(() => selected.classList.add('fade'), 10);
    
    // Update active tab
    document.querySelectorAll('#tabBar .tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    el.classList.add('active');
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
    
    // Get all selected answers
    const answers = {
        q1: document.querySelector('input[name="q1"]:checked')?.value,
        q2: document.querySelector('input[name="q2"]:checked')?.value,
        q3: document.querySelector('input[name="q3"]:checked')?.value
    };
    
    // Here you would typically send this data to your backend
    console.log('Assessment answers:', answers);
    
    alert('Cảm ơn bạn đã hoàn thành đánh giá! Chúng tôi sẽ liên hệ với bạn sớm.');
    closeAssessment();
}

// Chat Functionality
let firstMessage = true;

function initializeChat() {
    const chatBox = document.getElementById('chatBox');
    const userInput = document.getElementById('userInput');
    
    // Add welcome message
    chatBox.innerHTML = `
        <div class="chat-message ai">
            <p>Xin chào! Tôi là trợ lý AI của PeaceFlow. Tôi có thể giúp gì cho bạn hôm nay?</p>
        </div>
    `;
    
    // Handle enter key
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
}

async function sendMessage() {
    const chatBox = document.getElementById('chatBox');
    const userInput = document.getElementById('userInput');
    const text = userInput.value.trim();
    
    if (!text) return;
    
    // Add user message
    chatBox.innerHTML += `
        <div class="chat-message user">
            <p>${text}</p>
        </div>
    `;
    userInput.value = '';
    
    // Prepare prompt
    let prompt = text;
    if (firstMessage) {
        prompt = `Bạn hãy đóng vai trò là một chatbot của PeaceFlow, tư vấn cho người dùng trong việc giải tỏa lo lắng, trầm cảm. Hãy sử dụng những đoạn hội thoại ngắn để trao đổi với người dùng, dẫn dắt câu chuyện để nắm bắt tình trạng người dùng, từ đó đưa ra những tư vấn phù hợp.\nNgười dùng: ${text}`;
        firstMessage = false;
    }
    
    try {
        // Add loading indicator
        chatBox.innerHTML += `
            <div class="chat-message ai loading">
                <p>Đang soạn tin nhắn...</p>
            </div>
        `;
        
        // Send request to AI
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyDcJkasW6SuUu5xxY_2IfkIn1_4kLkoyCI', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });
        
        const data = await response.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Xin lỗi, tôi chưa thể trả lời.';
        
        // Remove loading indicator and add AI response
        chatBox.querySelector('.loading').remove();
        chatBox.innerHTML += `
            <div class="chat-message ai">
                <p>${reply}</p>
            </div>
        `;
        
        // Scroll to bottom
        chatBox.scrollTop = chatBox.scrollHeight;
    } catch (error) {
        console.error('Error:', error);
        chatBox.querySelector('.loading').remove();
        chatBox.innerHTML += `
            <div class="chat-message ai error">
                <p>Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.</p>
            </div>
        `;
    }
}

// Appointment Modal
function openAppointmentModal(expertName) {
    const modal = document.getElementById('appointmentModal');
    const expertNameElement = document.getElementById('expertName');
    const dateInput = document.getElementById('appointmentDate');
    
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    
    expertNameElement.textContent = expertName;
    modal.classList.remove('hidden');
}

function closeAppointmentModal() {
    document.getElementById('appointmentModal').classList.add('hidden');
    // Reset time slot selection
    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.classList.remove('selected');
    });
}

function selectTimeSlot(element, time) {
    // Remove selection from all slots
    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.classList.remove('selected');
    });
    
    // Add selection to clicked slot
    element.classList.add('selected');
    
    // Update hidden input
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
    
    // Here you would typically send this data to your backend
    console.log('Appointment details:', { date, time, note, expertName });
    
    alert('Đặt lịch thành công! Chúng tôi sẽ liên hệ với bạn để xác nhận.');
    closeAppointmentModal();
} 