<template>
	<icon-template
		:width="27"
		:height="27"
		name="Search"
	>
		<circle cx="11.25" cy="11.25" r="8.25" fill="transparent" stroke="currentColor" stroke-width="5.25"/>
		<path fill="currentColor" d="M20.5 16.5l6 6-4 4-6-6z"/>
	</icon-template>
</template>

<script>
	import iconTemplate from '../iconTemplate.vue';
	export default {
		components: {
			iconTemplate
		}
	}
</script>
