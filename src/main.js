import { initializeApp } from 'firebase/app'
import {
	getFirestore,
	getDocs,
	collection,
	addDoc,
	doc,
	deleteDoc,
	onSnapshot,
	orderBy,
	query,
} from 'firebase/firestore'

const firebaseConfig = {}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

const cafeList = document.querySelector('#cafe-list')
const cafeForm = document.querySelector('#add-cafe-form')

//create element and render cafes
const renderCafe = (item) => {
	let li = document.createElement('li')
	let name = document.createElement('span')
	let city = document.createElement('span')
	let cross = document.createElement('div')
	li.setAttribute('data-id', item.id)
	name.textContent = item.data().name
	city.textContent = item.data().city
	cross.textContent = 'x'
	li.appendChild(name)
	li.appendChild(city)
	li.appendChild(cross)
	cafeList.appendChild(li)

	//deleteing data
	cross.addEventListener('click', async (e) => {
		e.stopPropagation()
		let id = e.target.parentElement.getAttribute('data-id')
		try {
			await deleteDoc(doc(db, 'cafes', id))
			console.log(`doc with id ${id} was deleted `)
		} catch (error) {
			console.log('Failed to delete', error)
		}
	})
}

// const docs = async () => {
// 	const snapShot = await getDocs(
// 		query(
// 			collection(db, 'cafes'),

// 			orderBy('name', 'asc')
// 		)
// 	)
// 	snapShot.docs.forEach((cafe) => {
// 		renderCafe(cafe)
// 	})
// }

// docs()

//realtime

const docs = () => {
	const unsub = onSnapshot(
		query(collection(db, 'cafes'), orderBy('name', 'asc')),
		(snapshot) => {
			snapshot.docChanges().forEach((change) => {
				if (change.type === 'added') {
					renderCafe(change.doc)
				} else if (change.type === 'modified') {
					// handle modified document
				} else if (change.type === 'removed') {
					let li = cafeList.querySelector('[data-id=' + change.doc.id + ']')
					if (li) {
						li.remove()
					}
				}
			})
		}
	)

	return unsub
}
docs()

// Call docs function to start listening for real-time updates
const unsubscribe = docs()

// To stop listening for updates, call the unsubscribe function
unsubscribe()

///saving data
cafeForm.addEventListener('submit', async (e) => {
	e.preventDefault()
	try {
		const docRef = await addDoc(collection(db, 'cafes'), {
			name: cafeForm.name.value,
			city: cafeForm.city.value,
		})
		cafeForm.name.value = ''
		cafeForm.city.value = ''

		console.log('Document with id:', docRef.id)
	} catch (error) {
		console.log('error', error)
	}
})
