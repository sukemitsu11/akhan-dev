import type { ImageMetadata } from 'astro';
import komnata from '../assets/projects/komnata.png';
import kontur from '../assets/projects/kontur.png';
import gran from '../assets/projects/gran.png';
import list from '../assets/projects/list.png';

export interface Project {
  id: string;
  name: string;
  category: string;
  description: string;
  technologies: string[];
  image: ImageMetadata;
  previewLabel: string;
  demo: string;
  year: string;
  scope: string[];
}

/** Демонстрационные интерфейсы. Названия компаний, адреса и контакты вымышлены. */
export const projects: Project[] = [
  {
    id: 'komnata', name: 'Комната', category: 'Мебельный магазин',
    description: 'Каталог мебели с подбором по комнатам. Интерьерные коллекции, карточки товаров и пошаговый помощник для выбора.',
    technologies: ['HTML', 'CSS', 'JavaScript'], image: komnata,
    previewLabel: 'komnata.example', demo: '/demos/komnata/index.html', year: '2026',
    scope: ['Каталог и категории мебели', 'Карточки товаров и интерьерные подборки', 'Пошаговый подбор под комнату и бюджет'],
  },
  {
    id: 'kontur', name: 'Контур', category: 'Детейлинг и тюнинг',
    description: 'Сайт автомобильной студии с выразительной фотоподачей. Услуги, галерея работ и форма расчёта стоимости.',
    technologies: ['HTML', 'CSS', 'JavaScript'], image: kontur,
    previewLabel: 'kontur.example', demo: '/demos/kontur/index.html', year: '2026',
    scope: ['Каталог услуг с выбором задачи', 'Фильтруемая галерея работ', 'Форма расчёта и адаптивные страницы'],
  },
  {
    id: 'gran', name: 'Грань', category: 'Мебель на заказ',
    description: 'Интерьерный сайт о кухнях и системах хранения. Большие фотографии, готовые проекты и понятный путь от идеи до замера.',
    technologies: ['HTML', 'CSS', 'JavaScript'], image: gran,
    previewLabel: 'gran.example', demo: '/demos/gran/index.html', year: '2026',
    scope: ['Категории мебели на заказ', 'Галерея интерьерных проектов', 'Этапы работы и форма расчёта'],
  },
  {
    id: 'list', name: 'Чистый лист', category: 'Клининговый сервис',
    description: 'Сайт сервиса уборки с прозрачной подачей услуг. Состав работ, стартовые цены и пошаговая заявка на расчёт.',
    technologies: ['Node.js', 'JavaScript', 'CSS'], image: list,
    previewLabel: 'chisty-list.example', demo: '/demos/list/index.html', year: '2026',
    scope: ['Услуги и состав уборки', 'Сравнение результатов до и после', 'Пошаговый расчёт по параметрам объекта'],
  },
];
