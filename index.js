let model = []

let targetCard = {}

const view = {
  dragEl: '',
  oldCardId: '',
  editItemId: '',
  cardSection: document.querySelector('.card-section'),
  cards: document.querySelectorAll('.card-body'),
  items: document.querySelectorAll('.card-item'),
  picker: () => {
    new Litepicker({
      element: document.querySelector('#litepicker'),
      singleMode: false,
      lang: 'zh-TW',
      startDate: new Date(),
      minDate: new Date() - 1,
      maxDate: dayjs(new Date()).add(1, 'year'),
      maxDays: 18,
      tooltipText: {
        one: '天',
        other: '天'
      },
      tooltipNumber: (totalDays) => {
        return totalDays
      },
      setup: (picker) => {
        picker.on('selected', (date1, date2) => {
          const startText = document.querySelector('.start-date')
          const endText = document.querySelector('.end-date')
          let startDate = dayjs(date1.dateInstance).format('YYYY/MM/DD')
          let endDate = dayjs(date2.dateInstance).format('YYYY/MM/DD')
          startText.innerHTML = startDate
          endText.innerHTML = endDate
        })
      }
    })
  },
  getCardElement(data) {
    let temp = ''
    data.forEach((data, key) => {
      let itemTemp = ''
      if (data.items.length > 0) {
        data.items.forEach((item) => {
          itemTemp += `<li class="card-item" style="background:${item.color};" draggable="true" id="${item.id}" title="點兩下編輯">
                <div class="arrival-time">${item.arrivalTime}</div>
                <div class="category"><i class="fa-solid ${item.category}"></i></div>
                <div class="detail">
                  <span class="destination">${item.destination}</span>
                  <span class="budge">$${item.budget}</span>
                </div>
                <button class="delete-item-btn" type="button"><i class="fa-solid fa-xmark"></i></button>
              </li>`
        })
      }
      temp += `<div class="card" id="${data.date}">
            <div class="card-header">
              <span>${data.date}</span>
              <h3 class="card-title"><strong>Day ${key + 1}</strong></h3>
              <div class="card-action">
                <button class="add-item-btn" type="button"><i class="fa-solid fa-plus"></i></button>
                <button class="delete-card-btn" type="button"><i class="fa-solid fa-xmark" style="color:red;"></i></button>
              </div>
            </div>
            <div class="card-body">
              ${itemTemp}
            </div>
          </div>`
      itemTemp = ''
    })
    this.cardSection.innerHTML = temp
  },
  openModal() {
    const modal = document.querySelector('#modal')
    const modalTitle = modal.querySelector('.modal-title')
    const modalOverlay = document.querySelector('#modal-overlay')
    const addItemBtn = modal.querySelector('#add-item-btn')
    const editItemBtn = modal.querySelector('#edit-item-btn')
    const item = {
      arrivalTime: modal.querySelector('#arrival-time'),
      destination: modal.querySelector('#destination'),
      color: modal.querySelector('#color-picker'),
      category: modal.querySelector('#category'),
      budget: modal.querySelector('#budget')
    }
    modal.classList.remove('modal-hide')
    modalTitle.innerHTML = '新增項目'
    modalOverlay.classList.remove('modal-hide')
    addItemBtn.classList.remove('hide')
    editItemBtn.classList.add('hide')
    item.arrivalTime.setAttribute('value', '')
    item.destination.setAttribute('value', '')
    item.color.setAttribute('value', '')
    item.category.setAttribute('value', '')
    item.budget.setAttribute('value', '')
  },
  hideModal() {
    const modal = document.querySelector('#modal')
    const modalOverlay = document.querySelector('#modal-overlay')
    modal.classList.add('modal-hide')
    modalOverlay.classList.add('modal-hide')
  },
  handleDragStart(e) {
    e.target.classList.add('item-hide')
    // 移動效果
    e.dataTransfer.effectAllowed = 'move'
    view.dragEl = this
    view.oldCardId = this.parentElement.parentElement.id
    // 保存被拖拉的資料
    e.dataTransfer.setData('text/plain', this.id)
  },
  handleDragEnd(e) {
    this.classList.remove('item-hide')
  },
  handleDragEnter(e) {
    this.parentElement.classList.add('dragging')
  },
  handleDragLeave(e) {
    this.parentElement.classList.remove('dragging')
  },
  handleDragOver(e) {
    // 防止drop事件無法被觸發
    e.preventDefault()
    e.stopPropagation()
    // 對應effectAllowed移動效果
    e.dataTransfer.dropEffect = 'move'
    return false
  },
  handleDropped(e) {
    e.preventDefault()
    e.stopPropagation()
    const itemId = e.dataTransfer.getData('text/plain')
    const card = e.target.parentElement
    card.classList.remove('dragging')
    if (e.target.classList.contains('card-body')) {
      e.target.appendChild(view.dragEl)
      controller.handleDragData(card.id, itemId)
    }
  },
  editItemModal(e) {
    const modalTitle = modal.querySelector('.modal-title')
    const addItemBtn = modal.querySelector('#add-item-btn')
    const editItemBtn = modal.querySelector('#edit-item-btn')
    let editItem = {}
    const item = {
      arrivalTime: modal.querySelector('#arrival-time'),
      destination: modal.querySelector('#destination'),
      color: modal.querySelector('#color-picker'),
      category: modal.querySelector('#category'),
      budget: modal.querySelector('#budget')
    }
    view.openModal()
    modalTitle.innerHTML = '編輯項目'
    addItemBtn.classList.add('hide')
    editItemBtn.classList.remove('hide')
    model.forEach((data) => {
      data.items.forEach((item) => {
        if (item.id === this.id) {
          editItem = item
        }
      })
    })
    item.arrivalTime.setAttribute('value', editItem.arrivalTime)
    item.destination.setAttribute('value', editItem.destination)
    item.color.setAttribute('value', editItem.color)
    item.category.setAttribute('value', editItem.category)
    item.budget.setAttribute('value', editItem.budget)
    view.editItemId = editItem.id
  }
}

const controller = {
  getLocalData() {
    let data = JSON.parse(localStorage.getItem('cardData'))
    if (data === null) {
      model = []
    } else {
      model = data
    }
  },
  setLocalData(data) {
    localStorage.setItem('cardData', JSON.stringify(data))
  },
  removeLocalData() {
    localStorage.removeItem('cardData')
  },
  createItemData(cardId, item) {
    model.forEach((data) => {
      if (data.date === cardId) {
        data.items.push(item)
      }
      data.items.sort((item1, item2) =>
        item1.arrivalTime.localeCompare(item2.arrivalTime)
      )
    })
    this.setLocalData(model)
  },
  getModalItem() {
    // 取得modal中的資料
    let item = {
      id:
        view.editItemId !== ''
          ? view.editItemId
          : Math.floor(Math.random() * 10000).toString(16),
      arrivalTime: modal.querySelector('#arrival-time').value,
      destination: modal.querySelector('#destination').value,
      color: modal.querySelector('#color-picker').value,
      category: modal.querySelector('#category').value,
      budget: modal.querySelector('#budget').value
    }
    let isNull = Object.values(item).some((item) => item.trim() === '')
    if (isNull) {
      alert('請勿空白')
      return
    } else {
      return item
    }
  },
  deleteItemData(cardId, itemId) {
    model.forEach((data) => {
      if (data.date === cardId) {
        data.items = data.items.filter((item) => item.id !== itemId)
      }
    })
    this.setLocalData(model)
  },
  saveItem(editItem) {
    model.forEach((data) => {
      data.items.forEach((item) => {
        if (item.id === editItem.id) {
          item.arrivalTime = editItem.arrivalTime
          item.color = editItem.color
          item.category = editItem.category
          item.destination = editItem.destination
          item.budget = editItem.budget
        }
      })
    })
    this.setLocalData(model)
  },
  resetItemData(data) {
    data.forEach((data) => {
      data.items = []
    })
    this.setLocalData(data)
  },
  deleteCardData(date) {
    model = model.filter((data) => data.date !== date)
    controller.setLocalData(model)
  },
  createData(data) {
    const startDate = document.querySelector('.start-date').innerHTML
    const endDate = document.querySelector('.end-date').innerHTML
    const days = dayjs(endDate).diff(startDate, 'days')
    for (let i = 0; i <= days; i++) {
      const date = dayjs(startDate).add(i, 'day').format('YYYY/MM/DD')
      data.push({
        date: `${date}`,
        items: []
      })
    }
  },
  handleDragData(newCardId, itemId) {
    let dragItem = {}
    // 將item賦值給dragItem並從原card移除
    model.forEach((data) => {
      if (data.date === view.oldCardId) {
        data.items.forEach((item, index) => {
          if (item.id === itemId) {
            dragItem = item
            data.items.splice(index, 1)
          }
        })
      }
    })
    // 將dragItem移至新card
    model.forEach((data) => {
      if (data.date === newCardId) {
        data.items.push(dragItem)
      }
      data.items.sort((item1, item2) =>
        item1.arrivalTime.localeCompare(item2.arrivalTime)
      )
    })
    this.setLocalData(model)
    location.reload()
  },
  renderCards(data) {
    // 每次產生卡片重新掛監聽器
    view.getCardElement(data)
    this.handleCardListener()
  },
  handleActionListener() {
    const cardSection = document.querySelector('.card-section')
    const deleteCardsBtn = document.querySelector('.delete-cards-btn')
    const resetItemsBtn = document.querySelector('.reset-items-btn')
    deleteCardsBtn.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      if (cardSection.innerHTML === '') {
        alert('目前無卡片，無法執行動作')
        return
      } else if (confirm('此動作無法復原，確認刪除所有卡片？')) {
        controller.removeLocalData()
        cardSection.innerHTML = ''
      } else {
        return
      }
    })
    resetItemsBtn.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      if (cardSection.innerHTML === '') {
        alert('目前無卡片，無法執行動作')
        return
      } else if (confirm('此動作無法復原，確認重置所有行程？')) {
        controller.resetItemData(model)
        view.getCardElement(model)
      } else {
        return
      }
    })
  },
  handleCardListener() {
    const cardSection = document.querySelector('.card-section')
    const cards = cardSection.querySelectorAll('.card-body')
    const items = cardSection.querySelectorAll('.card-item')
    cardSection.addEventListener('click', (e) => {
      // btn監聽器：處理資料&重新渲染
      const target = e.target.classList
      const card = e.target.parentElement.parentElement.parentElement
      const cardId = card.id
      if (target.contains('add-item-btn')) {
        const cardBody = card.querySelector('.card-body')
        view.openModal()
        targetCard = { cardId, cardBody }
      } else if (target.contains('delete-card-btn')) {
        this.deleteCardData(cardId)
        this.renderCards(model)
      } else if (target.contains('delete-item-btn')) {
        const itemId = e.target.parentElement.id
        this.deleteItemData(cardId, itemId)
        this.renderCards(model)
      }
    })
    cards.forEach((card) => {
      card.addEventListener('dragenter', view.handleDragEnter)
      card.addEventListener('dragleave', view.handleDragLeave)
      card.addEventListener('dragover', view.handleDragOver)
      card.addEventListener('drop', view.handleDropped)
    })
    items.forEach((item) => {
      item.addEventListener('dragstart', view.handleDragStart)
      item.addEventListener('dragend', view.handleDragEnd)
      // TODO:編輯item
      item.addEventListener('dblclick', view.editItemModal)
    })
  },
  handleModalListener() {
    const closeModalBtn = document.querySelector('#close-modal-btn')
    const addItemBtn = document.querySelector('#add-item-btn')
    const editItemBtn = document.querySelector('#edit-item-btn')
    closeModalBtn.addEventListener('click', (e) => {
      view.hideModal()
    })
    addItemBtn.addEventListener('click', (e) => {
      e.preventDefault()
      // 處理資料&重新渲染
      const item = controller.getModalItem()
      if (item === undefined) return
      controller.createItemData(targetCard.cardId, item)
      targetCard = {}
      view.hideModal()
      controller.renderCards(model)
    })
    editItemBtn.addEventListener('click', (e) => {
      e.preventDefault()
      const item = controller.getModalItem()
      if (item === undefined) return
      controller.saveItem(item)
      view.editItemId = ''
      view.hideModal()
      controller.renderCards(model)
    })
  }
}

const datePicker = document.querySelector('.date-picker')

datePicker.addEventListener('DOMSubtreeModified', (e) => {
  e.preventDefault()
  e.stopPropagation()
  model = []
  controller.createData(model)
  controller.renderCards(model)
  controller.setLocalData(model)
})

view.picker()
controller.getLocalData()
controller.handleActionListener()
controller.handleModalListener()
controller.renderCards(model)
