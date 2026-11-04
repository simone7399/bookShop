import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/Home.vue'
import shelfView from '../views/bookshelf.vue'
import BooksView from '../views/books/books.vue'
import BookDetails from '../views/books/bookDetails.vue'
import NotFound from '../views/NotFound.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/Bookshelf',
      name: 'bookshelf',
      component: shelfView,
    },
    {
      path: '/books',
      name: 'books',
      component: BooksView,
    },
    {
      path: '/books/:id',
      name: 'bookDetails',
      component: BookDetails,
      props: true,
    },

    // Catch-all route for 404 Not Found
    {
      path: '/:catchAll(.*)*',
      name: 'NotFound',
      component: NotFound
    }
  ],
})

export default router
