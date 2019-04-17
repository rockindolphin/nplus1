<template>
	<span aria-hidden="true"
				:aria-label="name"
				class="icon__wrapper"
				role="img">
		<svg 
				:class=" 'icon__vue icon__vue--' + name.toLowerCase() "
				:width="width"
				:height="height"
				:viewBox="'0 0 ' + width + ' ' + height">
			<slot></slot>
		</svg>
	</span>
</template>

<script>

export default {
	props: {
		width: {
			type: Number,
			default: 16
		},
		height: {
			type: Number,
			default: 16
		},
		name: {
			type: String,
			default: ''
		}
	},
}
</script>
