/**
 * Kemet AI Receptionist Chat Widget
 * Floating circular chat head with AI icon
 */

class KemetChatWidget {
  constructor(options = {}) {
    this.apiUrl = options.apiUrl || '/api/chat';
    this.conversationHistory = [];
    this.isLoading = false;
    this.isOpen = false;

    this.chatBox = null;
    this.messagesContainer = null;
    this.inputField = null;
    this.sendButton = null;
    this.chatHead = null;

    this.init();
  }

  init() {
    this.createChatHead();
    this.createChatWidget();
    this.attachEventListeners();
  }

  createChatHead() {
    const head = document.createElement('div');
    head.className = 'chat-head';
    head.id = 'chat-head-button';
    head.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <!-- Chat bubble icon -->
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
    `;
    document.body.appendChild(head);
    this.chatHead = head;
  }

  createChatWidget() {
    const widget = document.createElement('div');
    widget.id = 'ai-receptionist';
    widget.className = 'ai-chat-widget minimized';

    widget.innerHTML = `
      <div class="chat-header">
        <h3>Kemet Assistant</h3>
        <button class="chat-close" type="button">−</button>
      </div>
      <div class="chat-messages"></div>
      <form class="chat-input-form">
        <input type="text" class="chat-input" placeholder="Type your message...">
        <button type="submit" class="chat-send-btn">⬆</button>
      </form>
    `;

    document.body.appendChild(widget);

    this.chatBox = widget;
    this.messagesContainer = widget.querySelector('.chat-messages');
    this.inputField = widget.querySelector('.chat-input');
    this.sendButton = widget.querySelector('.chat-send-btn');

    const closeBtn = widget.querySelector('.chat-close');
    closeBtn.addEventListener('click', () => this.toggleWidget());

    // Add greeting message
    this.addMessage(
      'Hello! I\'m Kemet\'s AI Receptionist. How can I help you today? Feel free to ask about our services, team, or portfolio.',
      'assistant'
    );
  }

  attachEventListeners() {
    // Chat head click to open
    this.chatHead.addEventListener('click', () => this.toggleWidget());

    // Chat form submit
    const form = this.sendButton.closest('form');
    form.addEventListener('submit', (e) => this.handleSubmit(e));
  }

  async handleSubmit(e) {
    e.preventDefault();

    const message = this.inputField.value.trim();
    if (!message || this.isLoading) return;

    this.inputField.value = '';
    this.addMessage(message, 'user');

    // Check if user wants to get in touch
    const contactKeywords = /get in touch|work with|want to work|interested|contact us|free consultation|proposal|project|let's talk|collabrat|hire|service|booking/i;
    const wantsContact = contactKeywords.test(message);

    try {
      this.isLoading = true;
      this.sendButton.disabled = true;
      this.showTypingIndicator();

      console.log('📤 Sending message to:', this.apiUrl);
      console.log('📝 Message:', message);
      console.log('📧 Contact intent detected:', wantsContact);

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          conversationHistory: this.conversationHistory
        })
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ HTTP Error:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();

      console.log('✓ Response data:', data);

      this.hideTypingIndicator();

      if (data.error) {
        console.error('API Error:', data.error);
        this.addMessage('Sorry, I encountered an error: ' + data.error, 'assistant');
      } else {
        this.addMessage(data.text, 'assistant');
        this.conversationHistory = data.conversationHistory;

        // If user wants to work with us, offer contact form
        if (wantsContact) {
          setTimeout(() => {
            this.showContactForm();
          }, 500);
        }
      }
    } catch (err) {
      console.error('❌ FETCH ERROR:', err.message);
      console.error('❌ Full error:', err);
      this.hideTypingIndicator();
      this.addMessage(
        'Sorry, I\'m having trouble connecting. Error: ' + err.message,
        'assistant'
      );
    } finally {
      this.isLoading = false;
      this.sendButton.disabled = false;
      this.inputField.focus();
    }
  }

  showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chat-message chat-message-assistant chat-typing-indicator';
    typingDiv.id = 'typing-indicator';
    typingDiv.innerHTML = `
      <div class="chat-message-text">
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
      </div>
    `;
    this.messagesContainer.appendChild(typingDiv);
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }

  hideTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }

  showContactForm() {
    const formDiv = document.createElement('div');
    formDiv.className = 'chat-contact-form';
    formDiv.innerHTML = `
      <div class="contact-form-header">📋 Get in Touch</div>
      
      <input type="text" placeholder="Your Name *" class="contact-input" id="contact-name" required />
      <input type="email" placeholder="Your Email *" class="contact-input" id="contact-email" required />
      <input type="tel" placeholder="Phone (Optional)" class="contact-input" id="contact-phone" />
      
      <input type="text" placeholder="Company Name (Optional)" class="contact-input" id="contact-company" />
      
      <select class="contact-input" id="contact-service">
        <option value="">Service of Interest (Optional)</option>
        <option value="Web Design &amp; Development">Web Design &amp; Development</option>
        <option value="Mobile App Development">Mobile App Development</option>
        <option value="SEO, GEO &amp; AEO">SEO, GEO &amp; AEO</option>
        <option value="Custom Software Development">Custom Software Development</option>
        <option value="AI Integrations">AI Integrations</option>
        <option value="Not Sure — Let's Talk">Not Sure — Let's Talk</option>
      </select>
      
      <select class="contact-input" id="contact-budget">
        <option value="">Budget Range (Optional)</option>
        <option value="Under $5,000">Under $5,000</option>
        <option value="$5,000 – $15,000">$5,000 – $15,000</option>
        <option value="$15,000 – $50,000">$15,000 – $50,000</option>
        <option value="$50,000+">$50,000+</option>
        <option value="Prefer to Discuss">Prefer to Discuss</option>
      </select>
      
      <textarea placeholder="Tell us about your project *" class="contact-input" id="contact-message" style="min-height: 70px; resize: none;"></textarea>
      
      <button class="contact-submit-btn" onclick="window.KemetChat.submitContactFromChat()">Submit</button>
    `;
    this.messagesContainer.appendChild(formDiv);
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }

  async submitContactFromChat() {
    const name = document.getElementById('contact-name')?.value.trim();
    const email = document.getElementById('contact-email')?.value.trim();
    const phone = document.getElementById('contact-phone')?.value.trim();
    const company = document.getElementById('contact-company')?.value.trim();
    const service = document.getElementById('contact-service')?.value;
    const budget = document.getElementById('contact-budget')?.value;
    const message = document.getElementById('contact-message')?.value.trim();

    if (!name || !email || !message) {
      alert('Please fill in Name, Email, and Project Message (marked with *)');
      return;
    }

    try {
      const resp = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name,
          email: email,
          phone: phone || 'Not provided',
          company: company || 'Not provided',
          service: service || 'Not provided',
          budget: budget || 'Not provided',
          project: 'Chat Widget Inquiry',
          source: 'Chat Widget',
          message: message,
          date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        })
      });

      const result = await resp.json();
      if (resp.ok && result.success) {
        this.addMessage('✅ Perfect! Your information has been submitted. Our team will reach out to you soon at ' + email + '!', 'assistant');
        // Clear contact form
        document.querySelectorAll('.contact-input').forEach(el => el.value = '');
        document.querySelector('.chat-contact-form').remove();
      } else {
        this.addMessage('Sorry, there was an issue submitting. Please try the contact form on our website.', 'assistant');
      }
    } catch (e) {
      console.error('Contact submission error:', e);
      this.addMessage('Unable to submit at the moment. Please try the contact form on our website.', 'assistant');
    }
  }

  addMessage(text, role) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message chat-message-${role}`;
    messageDiv.innerHTML = `<div class="chat-message-text">${this.parseMarkdown(text)}</div>`;
    this.messagesContainer.appendChild(messageDiv);
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }

  parseMarkdown(text) {
    // Escape HTML first
    let html = this.escapeHtml(text);

    // Convert **bold** to <strong>
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Convert *italic* to <em>
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Convert URLs to links
    html = html.replace(
      /(?:https?:\/\/|www\.)[^\s]+/g,
      (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`
    );

    // Convert email addresses to mailto links
    html = html.replace(
      /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/g,
      '<a href="mailto:$1" style="color: inherit; text-decoration: underline;">$1</a>'
    );

    // Convert line breaks to <br>
    html = html.replace(/\n/g, '<br>');

    // Convert bullet points (- or •) to list items
    html = html.replace(/^[\s]*[-•]\s+(.+?)(?=<br>|$)/gm, '<li style="margin-left: 1.5rem;">$1</li>');
    html = html.replace(/(<li[^>]*>.*?<\/li>)/s, '<ul style="margin: 0.5rem 0; padding-left: 0;">$1</ul>');

    // Convert numbers. to numbered list items
    html = html.replace(/^(\d+)\.\s+(.+?)(?=<br>|$)/gm, '<li style="margin-left: 1.5rem;">$2</li>');

    return html;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  toggleWidget() {
    this.isOpen = !this.isOpen;
    this.chatBox.classList.toggle('minimized');
    this.chatHead.classList.toggle('hidden');

    if (this.isOpen) {
      setTimeout(() => this.inputField.focus(), 100);
    }
  }
}

// Auto-init when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  if (typeof window.KemetChat === 'undefined') {
    window.KemetChat = new KemetChatWidget();
  }
});
