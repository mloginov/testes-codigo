const BASE_PATH = 'https://testes-codigo.pt/questao/'
const STORAGE_KEY = 'questao'

const NUM_QUESTIONS_BY_CAT = {
  'A': 592,
  'B': 3600
}

const relative = location.href.replace(BASE_PATH, '')
const parts = relative.split('/')
const category = parts[0]
const questionIndex = parseInt(parts[1], 10)


// todo store question seen in local storage
const storeQuestionData = async () => {
  const result = await chrome.storage.local.get(STORAGE_KEY)
  const data = result[STORAGE_KEY] || {}
  const categoryData = data[category] || []
  if (categoryData[questionIndex]) {
    return data
  }
  categoryData[questionIndex] = true
  data[category] = categoryData
  console.log('set data', data)
  await chrome.storage.local.set({ [STORAGE_KEY]: data })
  return data
}

const renderListContent = async () => {
  console.log('render list content', parts)
  // todo render check icons for question list
  const result = await chrome.storage.local.get(STORAGE_KEY)
  const data = result[STORAGE_KEY] || {}
  const categoryData = data[category] || []

  const questions = document.querySelectorAll('.main > div > p')
  categoryData.forEach((read, index) => {
    if (read) {
      questions.item(index).classList.add('testesCodigoExtension-list-item-read')
    }
  })
}

const renderItemContent = (data) => {
  const header = document.querySelector('.header')
  if (!header) {
    return
  }
  header.classList.add('testesCodigoExtension-item-header')
  header.append(createNavBar(data))
}

const switchQuestion = (newQuestion) => {
  location.href = `${BASE_PATH}${parts[0]}/${newQuestion}`
}

const createButton = (className, content, onClick, disabled) => {
  const btn = document.createElement('button')
  btn.classList.add(className)
  btn.type = 'button'
  btn.onclick = onClick
  btn.disabled = disabled
  btn.innerHTML = content
  return btn
}

const getPrevNextUnread = (data) => {
  const nextSlicedIndex = data[category].slice(questionIndex).findIndex(item => !item)
  const nextNotStoredUnread = data[category].length < NUM_QUESTIONS_BY_CAT[category] ? data[category].length : -1
  return {
    prevUnread: data[category].slice(0, questionIndex).findLastIndex(item => !item),
    nextUnread: nextSlicedIndex !== -1 ? nextSlicedIndex + questionIndex + 1 : nextNotStoredUnread
  }
}

const createNavBar = (data) => {
  console.log('createNavBar', data)
  const {prevUnread, nextUnread} = getPrevNextUnread(data)
  const navBar = document.createElement('div')
  navBar.classList.add('testesCodigoExtension-item-navBar')
  const backBtnContainer = document.createElement('div')
  backBtnContainer.classList.add('testesCodigoExtension-item-back-container')
  const prevUnreadBtn = createButton(
    'testesCodigoExtension-item-prevUnread',
    '&#129144; Previous Unread',
    () => switchQuestion(prevUnread),
    prevUnread === -1
  )
  backBtnContainer.append(prevUnreadBtn)
  const prevBtn = createButton(
    'testesCodigoExtension-item-prev',
    '&#129144; Previous',
    () => switchQuestion(questionIndex - 1),
    questionIndex === 0
  )
  backBtnContainer.append(prevBtn)
  navBar.append(backBtnContainer)
  const contentContainer = document.createElement('div')
  contentContainer.classList.add('testesCodigoExtension-item-content')
  contentContainer.innerHTML = `${questionIndex} / ${NUM_QUESTIONS_BY_CAT[category]}`
  navBar.append(contentContainer)
  const nextBtnContainer = document.createElement('div')
  nextBtnContainer.classList.add('testesCodigoExtension-item-next-container')
  const nextBtn = createButton(
    'testesCodigoExtension-item-next',
    '&#129146; Next',
    () => switchQuestion(questionIndex + 1),
    questionIndex >= NUM_QUESTIONS_BY_CAT[category]
  )
  nextBtnContainer.append(nextBtn)
  const nextUnreadBtn = createButton(
    'testesCodigoExtension-item-nextUnread',
    '&#129146; Next Unread',
    () => switchQuestion(nextUnread),
    nextUnread === -1
  )
  nextBtnContainer.append(nextUnreadBtn)
  navBar.append(nextBtnContainer)
  return navBar
}

const initialize = async () => {
  switch (parts.length) {
    case 1:
      parts[0] && renderListContent()
      break
    case 2: {
      const data = await storeQuestionData()
      renderItemContent(data)
      break
    }
  }
}

initialize()
