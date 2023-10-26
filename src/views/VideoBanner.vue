<template>
  <div class="container">
    <iframe
      ref="youtubeIframe"
      width="1280"
      height="720"
      src="https://www.youtube.com/embed/M7FIvfx5J10?enablejsapi=1&autoplay=1&controls=0&modestbranding=1&rel=0&showinfo=0&mute=1"
      title="YouTube video player"
      frameborder="0"
      allowfullscreen
    ></iframe>
    <div v-if="bannerVisible" class="banner">
      <h1 class="banner__title">ИСПОЛНИТЕ МЕЧТУ ВАШЕГО МАЛЫША!<br />ПОДАРИТЕ ЕМУ СОБАКУ!</h1>
      <img class="banner__img" src="../assets/index 1.png" alt="" />
      <p class="banner__text">Сканируйте QR-код<br />или нажмите ОК</p>
      <button @click="onBannerButtonClick" class="banner__btn">OK</button>
    </div>
    <div v-if="showModal" class="modal">
      <div v-if="confirmed" class="confirmed-content">
        <h2 class="confirmed-content__title">ЗАЯВКА ПРИНЯТА</h2>
        <p class="confirmed-content__text">
          Держите телефон под рукой. Скоро с Вами свяжется менеджер.
        </p>
      </div>
      <div v-else class="modal-content">
        <h2>Введите ваш номер Мобильного телефона</h2>
        <div class="number-display">
          +7({{ phone.slice(0, 3) }}) {{ phone.slice(3, 6) }}-{{ phone.slice(6, 8) }}-{{
            phone.slice(8)
          }}
        </div>
        <div class="modal-text">и с Вами свяжется наш менеждер для дальнейшей консультации</div>
        <div class="keypad">
          <button
            class="keypad-btn"
            v-for="num in numbers"
            :key="num"
            @click="addNumber(num)"
            :ref="`keypad-${num}`"
          >
            {{ num }}
          </button>
          <button class="delete" @click="deleteNumber()" ref="deleteButton">СТЕРЕТЬ</button>
        </div>

        <div class="checkbox-container">
          <input type="checkbox" v-model="agree" /> Согласие на обработку персональных данных
        </div>

        <button
          class="btn-agree"
          :disabled="!isFullNumber || !agree"
          @click="confirmNumber"
          ref="confirmButton"
        >
          Подтвердить номер
        </button>
      </div>
      <div class="modal-exit">
        <button class="modal-exit__btn" ref="exitButton" @click="closeModal">
          <img src="../assets/out.png" alt="" />
        </button>
        <img src="../assets/Frame 54.png" alt="" class="modal-exit__img" />
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'VideoBanner',
  data() {
    return {
      bannerVisible: false,
      player: null,
      showModal: false,
      phone: '',
      numbers: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
      agree: false,
      activeElement: null,
      confirmed: false,
      timeoutId: null
    }
  },
  computed: {
    isFullNumber() {
      return this.phone.length === 10
    }
  },
  methods: {
    setInactivityTimeout() {
      this.clearInactivityTimeout()
      this.timeoutId = setTimeout(() => {
        this.closeModal()
      }, 10000)
    },

    clearInactivityTimeout() {
      if (this.timeoutId) {
        clearTimeout(this.timeoutId)
        this.timeoutId = null
      }
    },
    onYouTubeIframeAPIReady() {
      this.player = new YT.Player(this.$refs.youtubeIframe, {
        events: {
          onStateChange: this.onPlayerStateChange,
          onReady: (event) => {
            event.target.playVideo()
          }
        }
      })
    },
    onPlayerStateChange(event) {
      if (event.data === YT.PlayerState.PLAYING && !this.bannerVisible) {
        setTimeout(() => {
          this.bannerVisible = true
        }, 5000)
      }
    },
    onBannerButtonClick() {
      this.player.pauseVideo()
      this.showModal = true
      this.setInactivityTimeout()
    },
    closeModal() {
      this.showModal = false
      this.player.playVideo()
      this.setInactivityTimeout()
    },
    addNumber(num) {
      if (this.phone.length < 10) {
        this.phone += num
        this.setInactivityTimeout()
      }
    },
    deleteNumber() {
      this.phone = this.phone.slice(0, -1)
      this.setInactivityTimeout()
    },
    confirmNumber() {
      if (this.isFullNumber && this.agree) {
        this.confirmed = true
        this.setInactivityTimeout()
      }
    },
    beforeDestroy() {
      document.removeEventListener('keydown', this.handleKeydown)
    },
    handleKeydown(event) {
      if (!this.showModal) return

      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'ArrowDown':
          this.changeFocus(event.key)
          break
        case 'Backspace':
          this.deleteNumber()
          break
        case 'Enter':
          if (this.activeElement === 'confirmButton') {
            this.confirmNumber()
          } else if (this.activeElement === 'deleteButton') {
            this.deleteNumber()
          } else if (this.activeElement === 'exitButton') {
            this.closeModal()
          }
          break
        default:
          if (this.numbers.includes(event.key)) {
            this.addNumber(event.key)
          }
          break
      }
    },
    changeFocus(direction) {
      const elements = [
        ...this.numbers.map((num) => this.$refs[`keypad-${num}`][0]),
        this.$refs.deleteButton,
        this.$refs.confirmButton,
        this.$refs.exitButton
      ]

      const numColumns = 3
      const currentIndex = elements.indexOf(document.activeElement)
      let nextIndex = currentIndex

      switch (direction) {
        case 'ArrowRight':
          nextIndex = (currentIndex + 1) % elements.length
          break
        case 'ArrowLeft':
          nextIndex = (currentIndex - 1 + elements.length) % elements.length
          break
        case 'ArrowUp':
          nextIndex = (currentIndex - numColumns + elements.length) % elements.length
          break
        case 'ArrowDown':
          nextIndex = (currentIndex + numColumns) % elements.length
          break
      }

      elements[nextIndex].focus()
    }
  },
  mounted() {
    document.addEventListener('keydown', this.handleKeydown)
    if (window.YT && window.YT.Player) {
      this.onYouTubeIframeAPIReady()
    } else {
      window.onYouTubeIframeAPIReady = this.onYouTubeIframeAPIReady
    }
  },
  activated() {
    if (this.player && this.player.playVideo) {
      this.player.playVideo()
    }
  }
})
</script>

<style scoped>
.container {
  position: relative;
  width: 1280px;
  height: 720px;
  margin: 0 auto;
  overflow: hidden;
  top: 0;
}

iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.banner {
  position: absolute;
  width: 251px;
  height: 367px;
  text-align: center;
  right: 0;
  bottom: 20%;
  background-color: #86d3f4;
  color: black;
}
.banner__title {
  font-size: 16px;
  font-weight: 500;
  text-transform: uppercase;
  word-wrap: break-word;
  padding: 20px 10px;
}
.banner__text {
  font-size: 14px;
  font-weight: 400;
  word-wrap: break-word;
}
.banner__btn {
  color: #86d3f4;
  background-color: black;
  font-size: 16px;
  font-weight: 500;
  text-transform: uppercase;
  padding: 16px 67px;
  cursor: pointer;
  margin-bottom: 10px;
}
.modal {
  display: flex;
  justify-content: space-between;
  position: fixed;
  z-index: 1;
  top: 8px;
  width: 1280px;
  height: 720px;
  overflow: hidden;
  background-image: url(../assets/bg.png);
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
}

.confirmed-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  background-color: #86d3f4;
  width: 380px;
  height: 720px;
  padding: 40px 24px;
  align-items: center;
}
.confirmed-content__title {
  color: black;
  font-size: 32px;
  margin-bottom: 15px;
  font-weight: 700;
  text-transform: uppercase;
  word-wrap: break-word;
  width: 284px;
}
.confirmed-content__text {
  color: black;
  font-size: 14px;
  font-weight: 400;
  word-wrap: break-word;
  width: 284px;
  text-align: center;
}

.modal-content {
  background-color: #86d3f4;
  max-width: 380px;
  height: 720px;
  padding: 40px 24px;
  text-align: center;
}
.modal-exit {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: end;
  padding: 20px;
}
.modal-exit__btn {
  background: transparent;
  border: none;
  cursor: pointer;
  width: 88px;
}
.modal-exit__img {
  padding-right: 20px;
  padding-bottom: 20px;
}

h2 {
  text-align: center;
  margin-bottom: 13px;
  color: black;
  font-size: 26px;
  font-weight: 400;
  word-wrap: break-word;
}
.modal-text {
  text-align: center;
  color: black;
  font-size: 14px;
  font-weight: 400;
  word-wrap: break-word;
  margin-top: 13px;
  margin-bottom: 33px;
}

.number-display {
  background-color: #86d3f4;
  border-radius: 5px;
  padding: 10px;
  text-align: center;
  font-size: 16px;
  margin-bottom: 20px;
  color: black;
  font-size: 32px;
  font-weight: 700;
  text-transform: uppercase;
  word-wrap: break-word;
}

.keypad {
  display: flex;
  width: 284px;
  height: 278px;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  margin: 0 auto;
}

.keypad-btn {
  padding: 12px 0;
  background-color: #86d3f4;
  border-radius: 5px;
  font-size: 16px;
  width: 88px;
  height: 52px;
}
.keypad-btn:active {
  background-color: black;
  color: #86d3f4;
}

.delete {
  width: 186px;
  padding: 16px 39px;
  background-color: #86d3f4;
  border-radius: 5px;
  font-size: 16px;
  height: 52px;
}

.checkbox-container {
  margin-top: 33px;
  width: 284px;
  margin-bottom: 13px;
  margin-right: auto;
  margin-left: auto;
}

.checkbox-container input[type='checkbox'] {
  margin-right: 6px;
  background-color: #86d3f4;
  color: black;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.btn-agree {
  background-color: black;
  color: #fff;
  text-transform: uppercase;
  border: none;
  cursor: pointer;
  padding: 16px 19px;
  width: 284px;
}
</style>
