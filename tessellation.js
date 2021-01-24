const validateRendererTemplate = (template) => {
  if (!template) return false
  return !['number', 'string', 'boolean', 'key', 'object', 'array', 'null']
    .some(k => !(k  in template))
}

const getValueType = (val) => {
  const type = typeof(val)
  if (type === 'object') {
    if (Array.isArray(val)) return 'array'
    if (val instanceof Date) return 'date'
    if (!val) return 'null'
  }
  return type
}

const ValueRendererFactory = (ele, eleName, classes=[]) => {
  let e = document.createElement(eleName)
  e.classList.add(...classes)
  e.innerHTML = ele
  return e
}

const DefaultNumberRenderer = (num) => ValueRendererFactory(num, 'tess-number', ['tess-value'])

const DefaultStringRenderer = (str) => ValueRendererFactory(str, 'tess-string', ['tess-value'])

const DefaultBooleanRenderer = (bool) => ValueRendererFactory(bool ? 'true' : 'false', 'tess-boolean', ['tess-value'])

const DefaultNullRenderer = () => ValueRendererFactory('null', 'null', ['tess-value'])

const DefaultDateRenderer = (date) => ValueRendererFactory(date.toLocaleString(), 'tess-date', ['tess-value'])

const DefaultKeyRenderer = (key) => ValueRendererFactory(key, 'button', ['tess-key'])

const DefaultArrayRenderer = (arr) => {
  let container = document.createElement('tess-array')
  container.classList.add('tess-container-obj')
  arr.forEach(v => {
    let val = DefaultRendererTemplate[getValueType(v)](v)
    container.appendChild(val)
    val.classList.add('tess-list-item')
  })
  return container
}

let DefaultObjectRenderer = (obj) => {
  const collections =
    { 'object': true
    , 'array': true
    }
  let container = document.createElement('tess-object')
  container.classList.add('tess-container-obj')
  Object
    .entries(obj)
    .forEach(
      ([k, v]) => {
        let valueType = getValueType(v)
        let kvEle = document.createElement('tess-key-value')
        let key = DefaultRendererTemplate['key'](k)
        kvEle.appendChild(key)
        let val = DefaultRendererTemplate[valueType](v)
        kvEle.appendChild(val)
        val.classList.add('tess-value')

        if (!collections[valueType]) {
          kvEle.classList.add('tess-side-by-side')
          key.classList.add('tess-side-by-side')
          val.classList.add('tess-side-by-side')
        } else {
          key.classList.add('tess-collapsible')
          addCollapsibleListener(key)
        }
        container.appendChild(kvEle)
      }
    )
  return container
}

const addCollapsibleListener = (ele) => {
  ele.addEventListener('click', function() {
    this.classList.toggle('active')
    let content = this.nextElementSibling
    if (content.style.display === 'flex') {
      content.style.display = 'none'
    } else {
      content.style.display = 'flex'
    }
  })
}

const DefaultRendererTemplate =
  { 'number': DefaultNumberRenderer
  , 'string': DefaultStringRenderer
  , 'boolean': DefaultBooleanRenderer
  , 'null': DefaultNullRenderer
  , 'key': DefaultKeyRenderer
  , 'object': DefaultObjectRenderer
  , 'array': DefaultArrayRenderer
  , 'date': DefaultDateRenderer
  }

const RenderJSON = (json, template=DefaultRendererTemplate) => {
  const type = getValueType(json)
  if (!validateRendererTemplate(template)) throw 'InvalidRenderer'
  return template[type](json)
}

export {
  RenderJSON
  , DefaultRendererTemplate
}
