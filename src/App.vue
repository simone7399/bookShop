<template>
  <nav>
    <RouterLink to="/">Home</RouterLink>
    <RouterLink to="/about">About</RouterLink>
    <RouterLink to="/books">Books</RouterLink>
  </nav>

  <RouterView />
</template>

<style>
nav {
  width: 100%;
}

nav a.router-link-exact-active {
  color: var(--color-accent);
}
</style>
