import path from 'path'
import webpack from 'webpack'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import WebpackMd5Hash from 'webpack-md5-hash'
import ExtractTextPlugin from 'extract-text-webpack-plugin'

export default {
	debug: true,
	devtool: 'source-map',
	noInfo: false,
	entry: {
		vendor: path.resolve(__dirname, 'src/vendor'),
		main: path.resolve(__dirname, 'src/index.jsx')
	},
	target: 'web',
	output: {
		path: path.resolve(__dirname, 'dist'),
		publicPath: '/',
		filename: '[name].[chunkhash].js'
	},
	plugins: [
		// Generate an external css file with a hash in the filename
		new ExtractTextPlugin('[name].[contenthash].css'),

		// Hash the files useing MD5 so that their names change when the content changes
		new WebpackMd5Hash(),

		// Create a seperate bundle of vendor libraries to cache seperately
		new webpack.optimize.CommonsChunkPlugin({
			name: 'vendor'
		}),

		// Create HTML file that includes reference to bundle.js
		new HtmlWebpackPlugin({
			template: 'src/index.html',
			minify: {
				removeComments: true,
				collapseWhitespace: true,
				removeRedundantAttributes: true,
				useShortDoctype: true,
				removeEmptyAttributes: true,
				removeStyleLinkTypeAttributes: true,
				keepClosingSlash: true,
				minifyJS: true,
				minifyCSS: true,
				minifyURLs: true
			},
			inject: 'head',
			// Properties defined here are available in index.html
			// using htmlWebpackPlugin.options.varName
			trackJSToken: 'c052939146f74fefbd3b4564797c0b10'
		}),

		// Eliminate duplicate packages
		new webpack.optimize.DedupePlugin(),

		new webpack.DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify('production')
		}),

		// Minify JS
		new webpack.optimize.UglifyJsPlugin()
	],
	module: {
		loaders: [
			{test: /\.jsx?$/, exclude: /node_modules/, loaders: ['babel']},
			{test: /\.css$/, loader: ExtractTextPlugin.extract('css?sourceMap')}
		]
	}
}
