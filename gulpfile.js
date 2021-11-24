// В переменные получаем установленные пакеты
const gulp          = require('gulp'),
      browserSync   = require('browser-sync').create(),
      //sass          = require('gulp-sass'),
      sass          = require('gulp-sass')(require('sass')),
      autoprefixer  = require('gulp-autoprefixer'),
      cssnano       = require('gulp-cssnano'),
      mmq           = require('gulp-merge-media-queries'),
      del           = require('del'),
      htmlmin       = require('gulp-htmlmin'),
      imagemin      = require('gulp-imagemin'),
      rigger        = require('gulp-rigger'),
      babel         = require('gulp-babel'),
      uglify        = require('gulp-uglifyjs'),
      handlebars    = require('handlebars');

// Создаем таск для сборки html файлов
gulp.task('html', () => {
  // Берем все файлы с расширением html в папке src
  return gulp.src('./src/*.html')
    // с помощью ригера собираем куски html файлов, если таковые есть (//= в index.html)
    .pipe(rigger())
    // минифицируем html
    .pipe(htmlmin({
      collapseWhitespace: false
    }))
    // выкидываем html в папку dist
    .pipe(gulp.dest('./dist'))
    // говорим browser-sync о том что пора перезагрузить барузер, так как файл изменился
    .pipe(browserSync.reload({
      stream: true
    }));
});

// Создаем таск для сборки css файлов
gulp.task('css', () => {
  // Берем только файл styles.scss в папке src, в который импортируеются паршалы
  return gulp.src('./src/sass/main.scss')
    // Преобразовываем sass в css
    .pipe(sass().on('error', sass.logError))
    // Создаем вендорные префиксы
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    // Группируем медиа правила
    .pipe(mmq({
      log: false
    }))
    // Минифицируем css
    .pipe(cssnano())
    // Выкидываем css в папку dist
    .pipe(gulp.dest('./dist'))
    // Говорим browser-sync о том что пора перезагрузить барузер так как файл изменился
    .pipe(browserSync.reload({
      stream: true
    }));
});

gulp.task('js', () => {
    return gulp.src('./src/*.js')
 // ['./src/*.js', './node_modules/babel-polyfill/dist/polyfill.js', './node_modules/handlebars/dist/handlebars.js']
        .pipe(rigger())
        .pipe(babel())
        .pipe(uglify('scripts.min.js'))
        .pipe(gulp.dest('dist'))
        .pipe(browserSync.reload({stream: true}));
});

// Создаем таск для оптимизации картинок
gulp.task('img', () => {
  // Берем все картинки из папки img
  return gulp.src('./src/images/**/*.+(png|jpg|gif|svg)')
    // Пробуем оптимизировать
    .pipe(imagemin([
      /* imagemin.gifsicle({interlaced: true}),
      imagemin.mozjpeg({quality: 75, progressive: true}),
      imagemin.optipng({optimizationLevel: 5}), */
      imagemin.svgo({
          plugins: [
              {removeViewBox: true},
              {cleanupIDs: false}
          ]
      })
  ]
      ))
    // Выкидываем в папку dist/img
    .pipe(gulp.dest('./dist/images'))
    // Говорим browser-sync о том что пора перезагрузить барузер так как файл изменился
    .pipe(browserSync.reload({
      stream: true
    }));
});

// Таск копирования всех шрифтов из папки fonts в dist/fonts
gulp.task('fonts', () => {
  return gulp.src('./src/fonts/**/*.*')
    .pipe(gulp.dest('./dist/fonts'))
    // Говорим browser-sync о том что пора перезагрузить барузер так как файл изменился
    .pipe(browserSync.reload({
      stream: true
    }));
});

// Таск слежения за изменениями файлов
gulp.task('watch', () => {
  // Следим за изменениями в любом html файле и вызываем таск 'html' на каждом изменении
  gulp.watch('./src/**/*.html', ['html']);
  // Следим за изменениями в любом sass файле и вызываем таск 'css' на каждом изменении
  gulp.watch('./src/sass/**/*.scss', ['css']);
  // Следим за изменениями в любом js файле и вызываем таск 'js' на каждом изменении
  gulp.watch('./src/**/*.js', ['js']);
  // Следим за изменениями картинок и вызываем таск 'img' на каждом изменении
  gulp.watch('./src/images/**/*.*', ['img']);
  // Следим за изменениями в шрифтах и вызываем таск 'fonts' на каждом изменении
  gulp.watch('./src/fonts/**/*.*', ['fonts']);
});

// Таск создания и запуска веб-сервера
gulp.task('server', () => {
  browserSync.init({
    server: {
      // указываем из какой папки "поднимать" сервер
      baseDir: "./dist"
    },
    // Говорим спрятать надоедливое окошко обновления в браузере
    notify: false
  });
  gulp.watch('./src/**/*.html', gulp.parallel('html'));
  gulp.watch('./src/sass/**/*.scss', gulp.parallel('css'));
  gulp.watch('./src/**/*.js', gulp.parallel('js'));
  gulp.watch('./src/images/**/*.*', gulp.parallel('img'));
  gulp.watch('./src/fonts/**/*.*', gulp.parallel('fonts'));
});

// Таск удаления папки dist, будем вызывать 1 раз перед началом сборки
gulp.task('del:dist', () => {
  //return del.sync('./dist');
  return del('./dist');
});

// Таск который 1 раз собирает все статические файлы
//gulp.task('build', ['html', 'css', 'js', 'img', 'fonts']);
gulp.task('build', gulp.series('html', 'css', 'js', 'img', 'fonts'));

// Главный таск, сначала удаляет папку dist,
// потом собирает статику, после чего поднимает сервер
// и затем запускает слежение за файлами
// Запускается из корня проекта командой npm start
//gulp.task('start', ['del:dist', 'build', 'server', 'watch']);
gulp.task('start', gulp.series('del:dist', 'build', 'server'));
