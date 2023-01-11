const fs = require('fs')

// Функция получающая тело нужного класса
function getClassContent(code, className) {
	let codeArr = code.split(/\n/)
	let openTagId = 0
	let closeTagId = 0 
	let closeTagCounter = 0
	let classCode = ''

	// Проходим по каждой строке основного кода и ищем нужный класс
	for (let i = 0, len = codeArr.length; i < len; i++) {
		// проверяем строку на содержание нужного нам класса
		if(codeArr[i].includes(className)) {
			openTagId = i
			break
		} 
	}

	// Начинаем проходить по массиву с строки нужного класса
	for (let i = openTagId, len = codeArr.length; i < len; i++) {
		// Делим строку на теги
		let stringArr = codeArr[i].split(/(<|>)/)

		// Проходим по каждому тегу
		stringArr.forEach(tag => {
			// Ищем закрывающий тег и вычитаем 1 если нашли
			if (tag.includes("/div")) {
				closeTagCounter -= 1
			} else if (tag.includes("div")) {
				closeTagCounter += 1
			}
		});
		classCode = classCode + codeArr[i] + "\n"
		// При 0 мы найдем закрывающий тег нужного класса
		if(closeTagCounter == 0) {
			closeTagId = i
			break
		}
	}

	let counter = classCode.split('\n')
	return classCode
}

function getClassName(string) {
	var regEx = 'class="(.*)"';
	var className = string.match(regEx)[1];
	return className
}

function createComponentFile(fileName) {
	fs.open(fileName, 'w', (err) => {
		if(err) {
			console.log(`Ошибка: Не удалось создать папку ${fileName}`)
		}; // не удалось создать папку
	});
}

function createComponentFolder(folderName) {

	try {
		fs.mkdirSync(folderName, err => {
			console.log('Папка успешно создана');
		});
	
	} catch (err) {
	
		console.log('Ошибка: Не удалось создать папку')
	
	}
}

function createComponent(componentName, componentCode, parentPath) {
	// Создаем папку и файлы
	let folderPath = `${parentPath}/${componentName}`
	
	createComponentFolder(folderPath)
	// Создаем файл jsx
	createComponentFile(`${folderPath}/${componentName}.jsx`)
	createComponentFile(`${folderPath}/${componentName}.css`)

	// Делим на строки чтобы понять, что я тупой кусок дерьма
	let componentCodeArr = componentCode.split('\n')

	let counter = 0
	// Проходим по каждой строке и определяем дочерние классы первого уровня
	for (let i = 0, len = componentCodeArr.length; i < len; i++) {

		// Делим строку на теги
		let stringArr = componentCodeArr[i].split(/(<|>)/)

		// Проходим по каждому тегу
		stringArr.forEach(tag => {
			if (tag.includes('/div')) {
				counter -= 1
			} else if (tag.includes('div')) {
				counter += 1
				if (counter == 2) {
					let childComponentName = getClassName(tag)
					let childComponentCode = getClassContent(componentCode, childComponentName)
					
					let componentCodeNew = componentCode.replace(childComponentCode, `<${childComponentName}/> \n`); 
					createComponent(childComponentName, childComponentCode, folderPath)
				}
			}
		});
	}
};

// Функция отвечающая за первичное чтение файла
function start(fileName, firstClassName, path) {
	let fileContent = fs.readFileSync(fileName, 'utf8');

	// Получаем тело класса с которого надо начать
	let code = getClassContent(fileContent, firstClassName)

	createComponent(firstClassName, code, path)

}

// Запуск программы
start('index.html', 'app', './components')
