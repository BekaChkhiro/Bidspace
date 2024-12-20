Vue.component('login-modal', {
  data() {
      return {
          username: '',
          password: '',
          errorMessage: '',
          showRegistration: false,
          regFirstName: '',
          regLastName: '',
          regEmail: '',
          regPhone: '',
          regUsername: '',
          regPersonalNumber: '',
          regPassword: '',
          regConfirmPassword: '',
          regTermsAgreed: false,
          showVerificationStep: false,
          verificationCode: '',
          verificationError: '',
      }
  },
  methods: {
      login() {
          if (!this.username || !this.password) {
              this.errorMessage = 'გთხოვთ შეავსოთ ყველა ველი';
              return;
          }

          fetch('/wp-json/custom/v1/login', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'X-WP-Nonce': wpApiSettings.nonce
              },
              body: JSON.stringify({ 
                  username: this.username,
                  password: this.password 
              })
          })
          .then(response => response.json())
          .then(data => {
              if (data.success) {
                  window.location.reload();
              } else {
                  this.errorMessage = data.message || 'ავტორიზაცია ვერ მოხერხდა';
              }
          })
          .catch(error => {
              console.error('Error:', error);
              this.errorMessage = 'დაფიქსირდა შეცდომა, სცადეთ თავიდან';
          });
      },
      closeModal() {
          this.$emit('close');
      },
      togglePasswordVisibility() {
          const passwordInput = this.$refs.passwordInput;
          passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
      },
      handleKeyPress(event) {
          if (event.key === 'Enter') {
              this.login();
          }
      },
      closeOnClickOutside(event) {
          if (event.target.classList.contains('modal-overlay')) {
              this.closeModal();
          }
      },
      toggleRegistration() {
          this.showRegistration = !this.showRegistration;
      },
      register() {
          if (!this.regTermsAgreed) {
              alert('გთხოვთ დაეთანხმოთ წესებსა და პირობებს');
              return;
          }

          if (this.regPassword !== this.regConfirmPassword) {
              alert('პაროლები არ ემთხვევა');
              return;
          }

          fetch('/wp-json/custom/v1/register', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'X-WP-Nonce': wpApiSettings.nonce
              },
              body: JSON.stringify({
                  firstName: this.regFirstName,
                  lastName: this.regLastName,
                  email: this.regEmail,
                  phone: this.regPhone,
                  username: this.regUsername,
                  personalNumber: this.regPersonalNumber,
                  password: this.regPassword
              })
          })
          .then(response => response.json())
          .then(data => {
              if (data.success) {
                  this.showVerificationStep = true;
              } else {
                  alert(data.message);
              }
          })
          .catch(error => {
              console.error('Error:', error);
              alert('დაფიქსირდა შეცდომა, სცადეთ თავიდან');
          });
      },
      verifyCode() {
          fetch('/wp-json/custom/v1/verify-code', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'X-WP-Nonce': wpApiSettings.nonce
              },
              body: JSON.stringify({
                  email: this.regEmail,
                  code: this.verificationCode
              })
          })
          .then(response => response.json())
          .then(data => {
              if (data.success) {
                  alert(data.message);
                  // Redirect to login page
                  window.location.href = '/login';
              } else {
                  this.verificationError = data.message;
              }
          })
          .catch(error => {
              console.error('Error:', error);
              this.verificationError = 'დაფიქსირდა შეცდომა, სცადეთ თავიდან';
          });
      }
  },
  template: `
      <div class="fixed z-50 inset-0 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center modal-overlay" @click="closeOnClickOutside">
          <div class="bg-white rounded-3xl w-3/12 mx-4 relative">
              <button @click="closeModal" class="text-gray-500 hover:text-gray-700 absolute top-4 right-4">
                  <svg class="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
              </button>
              
              <div v-if="!showRegistration">
                  <div class="px-9 pb-9 pt-12 flex flex-col gap-4 text-center">
                      <h3 class="text-xl font-semibold">ავტორიზაცია</h3>
                      <div class="flex flex-col gap-4">
                          <div class="w-full flex flex-col gap-2.5">
                              <label for="username" class="w-full text-sm text-left" style="color: #666;">ელ-ფოსტა</label>
                              <input 
                                  v-model="username" 
                                  type="text" id="username"
                                  style="border-color: #666;" 
                                  class="w-full px-3 py-2 border rounded-2xl shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-left"
                                  @keypress="handleKeyPress">
                          </div>
                          <div class="w-full flex flex-col gap-2.5">
                              <label for="password" class="w-full text-sm text-left" style="color: #666;">პაროლი</label>
                              <input 
                                  v-model="password" 
                                  type="password" 
                                  id="password" 
                                  ref="passwordInput" 
                                  style="border-color: #666;" 
                                  class="w-full px-3 py-2 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-left"
                                  @keypress="handleKeyPress">
                          </div>
                          <div class="w-full flex justify-end">
                              <a href="#" class="text-sm text-black hover:underline">დაგავიწყდა პაროლი?</a>
                          </div>
                          <button @click="login" class="w-full text-sm bg-black text-white p-4 rounded-full focus:outline-none">
                              შესვლა
                          </button>
                      </div>
                      
                      <hr>

                      <div class="w-full flex justify-center">
                          <p class="text-sm" style="color: #333;">
                              არ გაქვს ანგარიში? <a href="#" @click.prevent="toggleRegistration" style="color: #333;" class="font-bold hover:underline">დარეგისტრირდი</a>
                          </p>
                      </div>
                  </div>
              </div>
              
              <div v-else>
                  <div class="px-9 pb-9 pt-12 flex flex-col gap-4">
                      <button @click="toggleRegistration" class="text-gray-500 hover:text-gray-700 absolute" style="top: 12px; left: 22px;">
                          <svg class="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                          </svg>
                      </button>
                      
                      <h3 class="text-xl font-semibold text-center">რეგისტრაცია</h3>
                      <div class="flex flex-wrap -mx-2">
                          <div class="w-1/2 px-2">
                              <label for="regFirstName" class="block text-sm mb-2" style="color: #666;">სახელი</label>
                              <input 
                                  v-model="regFirstName"
                                  type="text" 
                                  id="regFirstName"
                                  style="border-color: #666;" 
                                  class="w-full px-3 py-2 mb-4 border rounded-2xl shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                          </div>
                          <div class="w-1/2 px-2">
                              <label for="regLastName" class="block text-sm mb-2" style="color: #666;">გვარი</label>
                              <input 
                                  v-model="regLastName"
                                  type="text" 
                                  id="regLastName"
                                  style="border-color: #666;" 
                                  class="w-full px-3 py-2 mb-4 border rounded-2xl shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                          </div>
                          <div class="w-1/2 px-2">
                              <label for="regEmail" class="block text-sm mb-2" style="color: #666;">ელ-ფოსტა</label>
                              <input 
                                  v-model="regEmail"
                                  type="email" 
                                  id="regEmail"
                                  style="border-color: #666;" 
                                  class="w-full px-3 py-2 mb-4 border rounded-2xl shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                          </div>
                          <div class="w-1/2 px-2">
                              <label for="regPhone" class="block text-sm mb-2" style="color: #666;">ტელეფონის ნომერი</label>
                              <input 
                                  v-model="regPhone"
                                  type="tel" 
                                  id="regPhone"
                                  style="border-color: #666;" 
                                  class="w-full px-3 py-2 mb-4 border rounded-2xl shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                          </div>
                          <div class="w-1/2 px-2">
                              <label for="regUsername" class="block text-sm mb-2" style="color: #666;">მომხმარებლის სახელი</label>
                              <input 
                                  v-model="regUsername"
                                  type="text" 
                                  id="regUsername"
                                  style="border-color: #666;" 
                                  class="w-full px-3 py-2 mb-4 border rounded-2xl shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                          </div>
                          <div class="w-1/2 px-2">
                              <label for="regPersonalNumber" class="block text-sm mb-2" style="color: #666;">პირადი ნომერი</label>
                              <input 
                                  v-model="regPersonalNumber"
                                  type="text" 
                                  id="regPersonalNumber"
                                  style="border-color: #666;" 
                                  class="w-full px-3 py-2 mb-4 border rounded-2xl shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                          </div>
                          <div class="w-1/2 px-2">
                              <label for="regPassword" class="block text-sm mb-2" style="color: #666;">პაროლი</label>
                              <input 
                                  v-model="regPassword"
                                  type="password" 
                                  id="regPassword"
                                  style="border-color: #666;" 
                                  class="w-full px-3 py-2 mb-4 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                          </div>
                          <div class="w-1/2 px-2">
                              <label for="regConfirmPassword" class="block text-sm mb-2" style="color: #666;">გაიმეორეთ პაროლი</label>
                              <input 
                                  v-model="regConfirmPassword"
                                  type="password" 
                                  id="regConfirmPassword"
                                  style="border-color: #666;" 
                                  class="w-full px-3 py-2 mb-4 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                          </div>
                      </div>
                      <div class="flex items-center mb-3">
                          <input type="checkbox" id="regTermsAgreed" v-model="regTermsAgreed" class="mr-2">
                          <label for="regTermsAgreed" class="text-sm" style="color: #666;">ვეთანხმები წესებს და პირობებს</label>
                      </div>
                      <div class="text-center">
                          <button @click="register" class="w-full text-sm bg-black text-white p-4 rounded-full focus:outline-none">
                              რეგისტრაცია
                          </button>
                      </div>

                      <div class="text-center">
                          <p class="text-sm" style="color: #333;">
                              უკვე გაქვს ანგარიში? <a href="#" @click.prevent="toggleRegistration" style="color: #333;" class="font-bold text-sm hover:underline">შესვლა</a>
                          </p>
                      </div>
          </div>
        </div>

         <div v-if="showVerificationStep">
                    <h3 class="text-3xl font-semibold text-center">დაადასტურე კოდი</h3>
                    <p class="text-center mb-4">შეიყვანე ელ-ფოსტაზე გამოგზავნილი 6-ციფრიანი კოდი:</p>
                    <div class="flex justify-center mb-4">
                        <input v-model="verificationCode" type="text" class="px-3 py-2 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-center" maxlength="6">
                    </div>
                    <div class="text-center">
                        <button @click="verifyCode" class="w-full bg-black text-white p-5 rounded-full focus:outline-none">
                            დადასტურება
                        </button>
                    </div>
                    <p v-if="verificationError" class="text-red-500 text-center mt-2">{{ verificationError }}</p>
                </div>
      </div>
    </div>
  `
});

new Vue({
  el: '#header-app',
  data: {
    showModal: false
  }
});