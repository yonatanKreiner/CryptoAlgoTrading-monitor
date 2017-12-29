import path from 'path'
import HtmlWebpackPlugin from 'html-webpack-plugin'

export default {
	debug: true,
	devtool: 'inline-source-map',
	noInfo: false,
	entry: [
		path.resolve(__dirname, 'src/index.jsx')
	],
	target: 'web',
	output: {
		path: path.resolve(__dirname, 'src'),
		publicPath: '/',
		filename: 'bundle.js'
	},
	plugins: [
		// Create HTML file that includes reference to bundle.js
		new HtmlWebpackPlugin({
			template: 'src/index.html',
			inject: true
		})
	],
	module: {
		loaders: [
			{test: /\.jsx?$/, exclude: /node_modules/, loaders: ['babel']},
			{test: /\.css$/, loaders: ['style', 'css']}
		]
	}
}
