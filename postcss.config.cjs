module.exports = {
  plugins: [
    require('postcss-import'),    // import หลายไฟล์ modular
    require('postcss-nesting'),   // nesting แบบ SCSS
    require('autoprefixer'),      // ใส่ prefix
    require('postcss-pxtorem'),   // px -> rem
    require('cssnano')({ preset: 'default' }) // minify production
  ]
}