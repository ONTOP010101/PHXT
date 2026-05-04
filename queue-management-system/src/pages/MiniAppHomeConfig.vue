<template>
  <div id="page-mini-app-home-config" class="slide-in">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-xl font-bold text-slate-800">小程序首页配置</h2>
        <p class="text-sm text-slate-500 mt-1">管理小程序首页的Banner和公告内容</p>
      </div>
      <button @click="openAddModal" class="btn btn-primary flex items-center gap-2">
        <i data-lucide="plus" class="w-4 h-4"></i>
        新增公告
      </button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2">
        <div class="card p-6 mb-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-slate-800">Banner配置</h3>
            <button @click="openBannerModal" class="text-sm text-blue-600 hover:text-blue-700 font-medium">
              编辑
            </button>
          </div>
          <div class="banner-preview p-4 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 relative overflow-hidden">
            <div class="absolute -top-5 -right-5 w-24 h-24 bg-yellow-500/10 rounded-full"></div>
            <div class="relative">
              <div class="text-xs font-semibold text-yellow-500 mb-2 uppercase tracking-widest">{{bannerConfig.tag}}</div>
              <div class="text-lg font-bold text-white mb-1 leading-relaxed whitespace-pre-line">{{bannerConfig.title}}</div>
              <div class="text-sm text-white/60 mb-3">{{bannerConfig.desc}}</div>
              <div class="inline-flex items-center gap-1 bg-yellow-500 text-slate-900 text-xs font-bold px-3 py-1.5 rounded-full">
                {{bannerConfig.btnText}}
                <div class="w-3 h-3 border-r border-b border-slate-900 rotate-[-45deg]"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="card p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-slate-800">公告列表</h3>
            <div class="text-sm text-slate-500">共 {{ads.length}} 条</div>
          </div>

          <div v-if="loading" class="flex items-center justify-center py-12">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span class="ml-3 text-slate-500">加载中...</span>
          </div>

          <div v-else-if="ads.length === 0" class="text-center py-12 text-slate-400">
            <i data-lucide="inbox" class="w-12 h-12 mx-auto mb-3 opacity-50"></i>
            <p>暂无公告数据</p>
          </div>

          <div v-else class="space-y-4">
            <div v-for="ad in ads" :key="ad.id" class="ad-item p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
              <div class="flex gap-4">
                <img v-if="ad.image" :src="ad.image" class="w-32 h-24 object-cover rounded-lg bg-slate-200" alt="" />
                <div v-else class="w-32 h-24 bg-slate-200 rounded-lg flex items-center justify-center">
                  <i data-lucide="image" class="w-8 h-8 text-slate-400"></i>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between gap-3 mb-2">
                    <div class="flex items-center gap-2">
                      <span class="tag-pill text-xs font-bold px-2 py-0.5 rounded-full" :style="{background: ad.tagBg, color: ad.tagColor}">{{ad.tag}}</span>
                      <span class="text-xs text-slate-400">{{ad.date}}</span>
                      <span v-if="ad.status === 'draft'" class="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">草稿</span>
                    </div>
                    <div class="flex items-center gap-1">
                      <button @click="openEditModal(ad)" class="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <i data-lucide="pencil" class="w-4 h-4"></i>
                      </button>
                      <button @click="confirmDelete(ad.id)" class="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                      </button>
                    </div>
                  </div>
                  <div class="font-semibold text-slate-800 mb-1 truncate">{{ad.title}}</div>
                  <div class="text-sm text-slate-500 line-clamp-2">{{ad.desc}}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-6">
        <div class="card p-6">
          <h3 class="font-semibold text-slate-800 mb-4">操作指南</h3>
          <ul class="space-y-3 text-sm text-slate-600">
            <li class="flex gap-3">
              <i data-lucide="info" class="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5"></i>
              <span>Banner配置会显示在小程序首页顶部</span>
            </li>
            <li class="flex gap-3">
              <i data-lucide="image" class="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"></i>
              <span>公告图片建议使用700x420分辨率</span>
            </li>
            <li class="flex gap-3">
              <i data-lucide="refresh-cw" class="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5"></i>
              <span>修改后保存即可在小程序端生效</span>
            </li>
          </ul>
        </div>

        <div class="card p-6">
          <h3 class="font-semibold text-slate-800 mb-4">创作工具</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button @click="openImageMaker" class="flex flex-col items-center gap-3 p-5 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all border border-blue-100 cursor-pointer group">
              <div class="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <i data-lucide="image" class="w-6 h-6 text-white"></i>
              </div>
              <div class="text-center">
                <div class="font-semibold text-blue-900">制作公告图片</div>
                <div class="text-xs text-blue-700/70">简单快速生成700x420规格封面</div>
              </div>
            </button>
            <button @click="openArticleEditor" class="flex flex-col items-center gap-3 p-5 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 transition-all border border-green-100 cursor-pointer group">
              <div class="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <i data-lucide="pen-tool" class="w-6 h-6 text-white"></i>
              </div>
              <div class="text-center">
                <div class="font-semibold text-green-900">撰写公告文章</div>
                <div class="text-xs text-green-700/70">图文排版，一键导出预览</div>
              </div>
            </button>
          </div>
        </div>

      </div>
    </div>

    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm h-screen min-h-screen" @click.self="closeModal">
        <div class="bg-white rounded-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden shadow-2xl">
          <div class="flex items-center justify-between p-6 border-b border-slate-100">
            <h3 class="text-lg font-bold text-slate-800">{{modalType === 'banner' ? '编辑Banner' : (isEditing ? '编辑公告' : '新增公告')}}</h3>
            <button @click="closeModal" class="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <i data-lucide="x" class="w-5 h-5 text-slate-400"></i>
            </button>
          </div>
          <div class="p-6 overflow-y-auto max-h-[calc(90vh-130px)]">
            <div v-if="modalType === 'banner'" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">标签文字</label>
                <input v-model="bannerForm.tag" type="text" class="form-input w-full" placeholder="如：NOTICE" />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">标题</label>
                <textarea v-model="bannerForm.title" class="form-input w-full" rows="2" placeholder="请输入Banner标题"></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">描述</label>
                <input v-model="bannerForm.desc" type="text" class="form-input w-full" placeholder="请输入描述文字" />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">按钮文字</label>
                <input v-model="bannerForm.btnText" type="text" class="form-input w-full" placeholder="如：立即查号" />
              </div>
            </div>

            <div v-else class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">
                  公告图片URL
                  <span class="text-red-500">*</span>
                </label>
                <input v-model="adForm.image" type="text" class="form-input w-full" :class="{'border-red-500': formErrors.image}" placeholder="https://..." @blur="validateField('image')" />
                <p v-if="formErrors.image" class="text-red-500 text-xs mt-1">{{ formErrors.image }}</p>
                <div v-if="adForm.image" class="mt-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
                  <img :src="adForm.image" class="w-full h-32 object-cover rounded-lg" alt="图片预览" @error="handleImageError" />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">
                  标签
                  <span class="text-red-500">*</span>
                </label>
                <input v-model="adForm.tag" type="text" class="form-input w-full" :class="{'border-red-500': formErrors.tag}" placeholder="如：展会资讯" @blur="validateField('tag')" />
                <p v-if="formErrors.tag" class="text-red-500 text-xs mt-1">{{ formErrors.tag }}</p>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1.5">标签背景色</label>
                  <input v-model="adForm.tagBg" type="color" class="form-input w-full h-10 p-1" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1.5">标签文字色</label>
                  <input v-model="adForm.tagColor" type="color" class="form-input w-full h-10 p-1" />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">
                  日期
                  <span class="text-red-500">*</span>
                </label>
                <input v-model="adForm.date" type="date" class="form-input w-full" :class="{'border-red-500': formErrors.date}" @blur="validateField('date')" />
                <p v-if="formErrors.date" class="text-red-500 text-xs mt-1">{{ formErrors.date }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">
                  标题
                  <span class="text-red-500">*</span>
                </label>
                <input v-model="adForm.title" type="text" class="form-input w-full" :class="{'border-red-500': formErrors.title}" placeholder="请输入公告标题" @blur="validateField('title')" />
                <p v-if="formErrors.title" class="text-red-500 text-xs mt-1">{{ formErrors.title }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">
                  描述
                  <span class="text-red-500">*</span>
                </label>
                <textarea v-model="adForm.desc" class="form-input w-full" :class="{'border-red-500': formErrors.desc}" rows="3" placeholder="请输入公告描述" @blur="validateField('desc')"></textarea>
                <p v-if="formErrors.desc" class="text-red-500 text-xs mt-1">{{ formErrors.desc }}</p>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1.5">排序</label>
                  <input v-model.number="adForm.sort" type="number" class="form-input w-full" placeholder="0" min="0" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1.5">状态</label>
                  <select v-model="adForm.status" class="form-input w-full">
                    <option value="published">已发布</option>
                    <option value="draft">草稿</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div class="flex gap-3 p-6 border-t border-slate-100 bg-slate-50">
            <button @click="closeModal" class="btn btn-outline flex-1 justify-center">取消</button>
            <button @click="saveModal" class="btn btn-primary flex-1 justify-center" :disabled="saving">
              {{saving ? '保存中...' : '保存'}}
            </button>
          </div>
        </div>
      </div>

      <div v-if="showDeleteConfirm" class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm h-screen min-h-screen" @click.self="showDeleteConfirm = false">
        <div class="bg-white rounded-2xl w-full max-w-sm mx-4 shadow-2xl">
          <div class="p-6 text-center">
            <div class="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <i data-lucide="alert-triangle" class="w-6 h-6"></i>
            </div>
            <h3 class="text-lg font-bold text-slate-800 mb-2">确认删除</h3>
            <p class="text-slate-500 mb-6">确定要删除这条公告吗？此操作无法撤销。</p>
            <div class="flex gap-3">
              <button @click="showDeleteConfirm = false" class="btn btn-outline flex-1 justify-center">取消</button>
              <button @click="deleteAd" class="btn btn-danger flex-1 justify-center" :disabled="saving">
                {{saving ? '删除中...' : '删除'}}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="showImageMaker" class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm h-screen min-h-screen" @click.self="showImageMaker = false">
        <div class="bg-white rounded-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden shadow-2xl">
          <div class="flex items-center justify-between p-6 border-b border-slate-100">
            <h3 class="text-lg font-bold text-slate-800">公告图片制作工具</h3>
            <button @click="showImageMaker = false" class="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <i data-lucide="x" class="w-5 h-5 text-slate-400"></i>
            </button>
          </div>
          <div class="p-6 overflow-y-auto max-h-[calc(90vh-130px)]">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1.5">选择背景</label>
                  <div class="grid grid-cols-4 gap-2">
                    <button v-for="bg in bgPresets" :key="bg.name" @click="bg.value === 'compress' ? showCompressTool = true : (bg.value === 'custom' ? customImageInput?.click() : imageMaker.bg = bg.value)" class="aspect-[7/4] rounded-xl border-2 transition-all relative overflow-hidden" :class="{'border-blue-500': imageMaker.bg === bg.value || (bg.value === 'custom' && imageMaker.customImage), 'border-slate-200': !(imageMaker.bg === bg.value || (bg.value === 'custom' && imageMaker.customImage))}" :style="bg.value !== 'custom' && bg.value !== 'compress' ? {background: bg.value} : {}">
                      <span v-if="bg.value === 'custom'" class="absolute inset-0 flex flex-col items-center justify-center bg-slate-100">
                        <i data-lucide="upload" class="w-6 h-6 text-slate-500 mb-1"></i>
                        <span class="text-xs text-slate-500">上传图片</span>
                      </span>
                      <span v-if="bg.value === 'compress'" class="absolute inset-0 flex flex-col items-center justify-center bg-blue-50">
                        <i data-lucide="file-image" class="w-6 h-6 text-blue-500 mb-1"></i>
                        <span class="text-xs text-blue-500">图片压缩</span>
                      </span>
                    </button>
                  </div>
                  <input ref="customImageInput" type="file" accept="image/*" class="hidden" @change="handleCustomImageUpload" />
                </div>
                <div v-if="imageMaker.bg === 'custom' && imageMaker.customImage" class="text-sm text-slate-600">
                  <span>✅ 已上传自定义背景</span>
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1.5">主标题</label>
                  <input v-model="imageMaker.title" type="text" class="form-input w-full" placeholder="请输入主标题" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1.5">副标题</label>
                  <input v-model="imageMaker.subtitle" type="text" class="form-input w-full" placeholder="请输入副标题" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1.5">标签</label>
                  <input v-model="imageMaker.tag" type="text" class="form-input w-full" placeholder="请输入标签" />
                </div>
              </div>
              <div class="space-y-4">
                <div class="aspect-[7/4] bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                  <div class="w-full h-full flex flex-col justify-center items-center p-6 relative" :style="imageMaker.bg === 'custom' ? {backgroundImage: `url(${imageMaker.customImage})`, backgroundSize: 'cover', backgroundPosition: 'center'} : {background: imageMaker.bg}">
                    <div v-if="imageMaker.tag" class="absolute top-4 left-4 bg-white/90 text-slate-800 px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
                      {{ imageMaker.tag }}
                    </div>
                    <div class="text-center">
                      <h2 v-if="imageMaker.title" class="text-3xl font-bold text-white drop-shadow-lg mb-2">{{ imageMaker.title }}</h2>
                      <p v-if="imageMaker.subtitle" class="text-white/90 drop-shadow">{{ imageMaker.subtitle }}</p>
                    </div>
                  </div>
                </div>
                <div class="text-center text-xs text-slate-500">预览效果 700x420</div>
              </div>
            </div>
          </div>
          <div class="flex gap-3 p-6 border-t border-slate-100 bg-slate-50">
            <button @click="showImageMaker = false" class="btn btn-outline flex-1 justify-center">取消</button>
            <button @click="downloadImage" class="btn btn-primary flex-1 justify-center">
              <i data-lucide="download" class="w-4 h-4 mr-2"></i>
              导出图片
            </button>
            <button @click="useImage" class="btn btn-success flex-1 justify-center">
              <i data-lucide="check" class="w-4 h-4 mr-2"></i>
              直接使用
            </button>
          </div>
        </div>
      </div>

      <div v-if="showArticleEditor" class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm h-screen min-h-screen" @click.self="showArticleEditor = false">
        <div class="bg-white rounded-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden shadow-2xl">
          <div class="flex items-center justify-between p-6 border-b border-slate-100">
            <h3 class="text-lg font-bold text-slate-800">公告文章编辑器</h3>
            <button @click="showArticleEditor = false" class="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <i data-lucide="x" class="w-5 h-5 text-slate-400"></i>
            </button>
          </div>
          <div class="p-6 overflow-y-auto max-h-[calc(90vh-130px)]">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1.5">文章标题</label>
                  <input v-model="articleEditor.title" type="text" class="form-input w-full text-lg font-semibold" placeholder="请输入文章标题" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1.5">文章内容</label>
                  <textarea v-model="articleEditor.content" class="form-input w-full" rows="12" placeholder="请输入文章内容"></textarea>
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1.5">插入图片链接</label>
                  <input v-model="articleEditor.image" type="text" class="form-input w-full" placeholder="请输入图片链接" />
                </div>
              </div>
              <div class="space-y-4">
                <div class="bg-slate-50 rounded-xl p-6 border border-slate-200">
                  <h2 class="text-xl font-bold text-slate-800 mb-3">{{ articleEditor.title || '文章预览' }}</h2>
                  <div v-if="articleEditor.image" class="mb-4">
                    <img :src="articleEditor.image" class="w-full rounded-lg object-cover" />
                  </div>
                  <p class="text-slate-700 whitespace-pre-wrap">{{ articleEditor.content }}</p>
                </div>
              </div>
            </div>
          </div>
          <div class="flex gap-3 p-6 border-t border-slate-100 bg-slate-50">
            <button @click="showArticleEditor = false" class="btn btn-outline flex-1 justify-center">取消</button>
            <button @click="useArticle" class="btn btn-primary flex-1 justify-center">
              <i data-lucide="check" class="w-4 h-4 mr-2"></i>
              生成公告
            </button>
          </div>
        </div>
      </div>

      <div v-if="showCompressTool" class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm h-screen min-h-screen" @click.self="showCompressTool = false">
        <div class="bg-white rounded-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden shadow-2xl">
          <div class="flex items-center justify-between p-6 border-b border-slate-100">
            <h3 class="text-lg font-bold text-slate-800">图片压缩工具</h3>
            <button @click="showCompressTool = false" class="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <i data-lucide="x" class="w-5 h-5 text-slate-400"></i>
            </button>
          </div>
          <div class="p-6 overflow-y-auto max-h-[calc(90vh-130px)]">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">上传图片</label>
                <div @click="compressImageInput?.click()" class="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all">
                  <i data-lucide="upload-cloud" class="w-12 h-12 text-slate-400 mx-auto mb-3"></i>
                  <p class="text-slate-600 mb-1">点击选择图片</p>
                  <p class="text-xs text-slate-400">支持 JPG、PNG、GIF 格式</p>
                </div>
                <input ref="compressImageInput" type="file" accept="image/*" class="hidden" @change="handleCompressImageUpload" />
              </div>

              <div v-if="originalImage">
                <label class="block text-sm font-medium text-slate-700 mb-2">原图预览</label>
                <img :src="originalImage" class="w-full rounded-lg mb-2" />
                <p class="text-xs text-slate-500">{{ formatFileSize(originalSize) }}</p>
              </div>

              <div v-if="compressedImage">
                <label class="block text-sm font-medium text-slate-700 mb-2">压缩后预览</label>
                <img :src="compressedImage" class="w-full rounded-lg mb-2" />
                <p class="text-xs text-green-600 mb-3">压缩后: {{ formatFileSize(compressedSize) }} (节省 {{ Math.round(100 - (compressedSize / originalSize) * 100) }}%)</p>
                <div class="flex gap-2">
                  <button @click="copyImageLink" class="btn btn-primary flex-1 justify-center">
                    <i data-lucide="copy" class="w-4 h-4 mr-2"></i>
                    复制图片链接
                  </button>
                  <button @click="useCompressedImage" class="btn btn-success flex-1 justify-center">
                    <i data-lucide="check" class="w-4 h-4 mr-2"></i>
                    直接使用
                  </button>
                </div>
              </div>

              <div v-if="originalImage && !compressedImage">
                <div class="space-y-3">
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">压缩质量: {{ compressQuality }}%</label>
                    <input v-model.number="compressQuality" type="range" min="10" max="100" class="w-full" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">最大宽度: {{ compressWidth }}px</label>
                    <input v-model.number="compressWidth" type="range" min="400" max="1200" step="100" class="w-full" />
                  </div>
                  <button @click="compressImage" class="btn btn-primary w-full justify-center" :disabled="compressing">
                    <i v-if="compressing" data-lucide="loader-2" class="w-4 h-4 mr-2 animate-spin"></i>
                    {{ compressing ? '压缩中...' : '开始压缩' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { getBanner, saveBanner, getNoticeList, addNotice, updateNotice, deleteNotice } from '@/api/miniapp'

const loading = ref(false)
const saving = ref(false)

const bannerConfig = ref({
  tag: 'NOTICE',
  title: '2024广州玩具展览会\n厂商专属排号服务',
  desc: '实时叫号 · 无需等候 · 高效洽谈',
  btnText: '立即查号'
})

const ads = ref([])

const showModal = ref(false)
const modalType = ref('banner')
const isEditing = ref(false)
const editingId = ref(null)

const bannerForm = ref({ ...bannerConfig.value })
const adForm = ref({
  image: '',
  tag: '',
  tagBg: '#dcfce7',
  tagColor: '#16a34a',
  date: '',
  title: '',
  desc: '',
  sort: 0,
  status: 'published'
})

const showDeleteConfirm = ref(false)
const deletingId = ref(null)

const showImageMaker = ref(false)
const showArticleEditor = ref(false)

const bgPresets = [
  { name: '蓝色渐变', value: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)' },
  { name: '绿色渐变', value: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' },
  { name: '紫色渐变', value: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)' },
  { name: '橙色渐变', value: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' },
  { name: '粉色渐变', value: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)' },
  { name: '青色渐变', value: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)' },
  { name: '上传图片', value: 'custom' },
  { name: '图片压缩', value: 'compress' }
]

const imageMaker = ref({
  bg: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
  customImage: '',
  title: '',
  subtitle: '',
  tag: ''
})

const customImageInput = ref(null)

// 压缩工具相关状态
const showCompressTool = ref(false)
const compressImageInput = ref(null)
const originalImage = ref('')
const originalSize = ref(0)
const compressedImage = ref('')
const compressedSize = ref(0)
const compressQuality = ref(70)
const compressWidth = ref(700)
const compressing = ref(false)

const articleEditor = ref({
  title: '',
  content: '',
  image: ''
})

const formErrors = ref({
  image: '',
  tag: '',
  date: '',
  title: '',
  desc: ''
})

const resetFormErrors = () => {
  formErrors.value = {
    image: '',
    tag: '',
    date: '',
    title: '',
    desc: ''
  }
}

const validateField = (field) => {
  const value = adForm.value[field]
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    const fieldNames = {
      image: '请输入公告图片URL',
      tag: '请输入标签',
      date: '请选择日期',
      title: '请输入标题',
      desc: '请输入描述'
    }
    formErrors.value[field] = fieldNames[field] || '此字段为必填项'
    return false
  } else {
    formErrors.value[field] = ''
    return true
  }
}

const validateForm = () => {
  const fields = ['image', 'tag', 'date', 'title', 'desc']
  let isValid = true
  fields.forEach(field => {
    if (!validateField(field)) {
      isValid = false
    }
  })
  return isValid
}

const handleImageError = (e) => {
  e.target.src = ''
  e.target.style.display = 'none'
  e.target.nextElementSibling?.remove()
  const errorText = document.createElement('div')
  errorText.className = 'text-red-500 text-xs text-center py-2'
  errorText.textContent = '图片加载失败，请检查URL'
  e.target.parentElement.appendChild(errorText)
}

const loadData = async () => {
  loading.value = true
  try {
    const [bannerRes, noticesRes] = await Promise.all([
      getBanner(),
      getNoticeList()
    ])
    if (bannerRes.data) {
      bannerConfig.value = {
        tag: bannerRes.data.tag || 'NOTICE',
        title: bannerRes.data.title || '',
        desc: bannerRes.data.desc || '',
        btnText: bannerRes.data.btnText || '立即查号'
      }
    }
    if (noticesRes.data) {
      ads.value = noticesRes.data
    }
  } catch (error) {
    console.error('加载数据失败:', error)
    showToast('加载数据失败', 'error')
  } finally {
    loading.value = false
    refreshIcons()
  }
}

const openBannerModal = () => {
  bannerForm.value = { ...bannerConfig.value }
  modalType.value = 'banner'
  showModal.value = true
  refreshIcons()
}

const openAddModal = () => {
  isEditing.value = false
  editingId.value = null
  resetFormErrors()
  adForm.value = {
    image: '',
    tag: '',
    tagBg: '#dcfce7',
    tagColor: '#16a34a',
    date: new Date().toISOString().split('T')[0],
    title: '',
    desc: '',
    sort: 0,
    status: 'published'
  }
  modalType.value = 'ad'
  showModal.value = true
  refreshIcons()
}

const openEditModal = (ad) => {
  isEditing.value = true
  editingId.value = ad.id
  resetFormErrors()
  adForm.value = {
    image: ad.image || '',
    tag: ad.tag || '',
    tagBg: ad.tagBg || '#dcfce7',
    tagColor: ad.tagColor || '#16a34a',
    date: ad.date || '',
    title: ad.title || '',
    desc: ad.desc || '',
    sort: ad.sort || 0,
    status: ad.status || 'published'
  }
  modalType.value = 'ad'
  showModal.value = true
  refreshIcons()
}

const closeModal = () => {
  showModal.value = false
}

const saveModal = async () => {
  if (modalType.value !== 'banner') {
    if (!validateForm()) {
      showToast('请填写所有必填项', 'error')
      return
    }
  }

  saving.value = true
  try {
    const submitData = modalType.value === 'banner' 
      ? { ...bannerForm.value }
      : { ...adForm.value }

    if (modalType.value === 'banner') {
      await saveBanner(submitData)
      bannerConfig.value = { ...submitData }
      showToast('Banner保存成功')
    } else {
      if (isEditing.value) {
        await updateNotice(editingId.value, submitData)
        showToast('公告更新成功')
      } else {
        await addNotice(submitData)
        showToast('公告创建成功')
      }
      await loadData()
    }
    showModal.value = false
  } catch (error) {
    console.error('保存失败:', error)
    const errorMsg = error?.response?.data?.message || error?.message || '保存失败'
    showToast(errorMsg, 'error')
  } finally {
    saving.value = false
  }
}

const confirmDelete = (id) => {
  deletingId.value = id
  showDeleteConfirm.value = true
  refreshIcons()
}

const deleteAd = async () => {
  saving.value = true
  try {
    await deleteNotice(deletingId.value)
    showDeleteConfirm.value = false
    showToast('删除成功')
    await loadData()
  } catch (error) {
    console.error('删除失败:', error)
    showToast('删除失败', 'error')
  } finally {
    saving.value = false
  }
}

const showToast = (message, type = 'success') => {
  const toast = document.createElement('div')
  const bgColor = type === 'error' ? 'bg-red-600' : 'bg-slate-800'
  const iconName = type === 'error' ? 'alert-circle' : 'check'
  const iconColor = type === 'error' ? 'text-red-300' : 'text-green-400'
  toast.className = `fixed top-24 left-1/2 -translate-x-1/2 ${bgColor} text-white px-6 py-3 rounded-xl shadow-lg z-50 flex items-center gap-2`
  toast.innerHTML = `<i data-lucide="${iconName}" class="w-4 h-4 ${iconColor}"></i>${message}`
  document.body.appendChild(toast)
  if (window.lucide) window.lucide.createIcons()
  setTimeout(() => {
    toast.style.opacity = '0'
    toast.style.transition = 'opacity 0.3s'
    setTimeout(() => toast.remove(), 300)
  }, 2000)
}

const refreshIcons = () => {
  setTimeout(() => {
    if (window.lucide) window.lucide.createIcons()
  }, 100)
}

const openImageMaker = () => {
  imageMaker.value = {
    bg: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
    customImage: '',
    title: '',
    subtitle: '',
    tag: ''
  }
  showImageMaker.value = true
  refreshIcons()
}

// 监听压缩工具弹窗打开
watch(showCompressTool, (val) => {
  if (val) {
    originalImage.value = ''
    compressedImage.value = ''
    compressQuality.value = 70
    compressWidth.value = 700
    refreshIcons()
  }
})

const handleCustomImageUpload = (e) => {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => {
    imageMaker.value.bg = 'custom'
    imageMaker.value.customImage = e.target.result
    showToast('背景图片上传成功')
  }
  reader.readAsDataURL(file)
}

const openArticleEditor = () => {
  articleEditor.value = {
    title: '',
    content: '',
    image: ''
  }
  showArticleEditor.value = true
  refreshIcons()
}

const downloadImage = () => {
  showToast('图片导出功能开发中', 'info')
}

const useImage = () => {
  if (!imageMaker.value.title) {
    showToast('请先填写标题', 'error')
    return
  }
  openAddModal()
  // 如果是自定义背景图片，直接使用压缩后的图片；否则使用默认占位图
  if (imageMaker.value.bg === 'custom' && imageMaker.value.customImage) {
    adForm.value.image = imageMaker.value.customImage
  } else {
    adForm.value.image = 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=700&h=420&fit=crop'
  }
  adForm.value.title = imageMaker.value.title
  adForm.value.desc = imageMaker.value.subtitle || ''
  adForm.value.tag = imageMaker.value.tag || '公告'
  showImageMaker.value = false
  showToast('已将内容填充到新增公告')
}

const useArticle = () => {
  if (!articleEditor.value.title) {
    showToast('请先填写标题', 'error')
    return
  }
  openAddModal()
  adForm.value.image = articleEditor.value.image || 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=700&h=420&fit=crop'
  adForm.value.title = articleEditor.value.title
  adForm.value.desc = articleEditor.value.content ? articleEditor.value.content.substring(0, 100) + (articleEditor.value.content.length > 100 ? '...' : '') : ''
  adForm.value.tag = '文章'
  showArticleEditor.value = false
  showToast('已将内容填充到新增公告')
}

onMounted(() => {
  loadData().then(() => refreshIcons())
})

// 压缩工具函数
const handleCompressImageUpload = (e) => {
  const file = e.target.files[0]
  if (!file) return
  originalSize.value = file.size
  const reader = new FileReader()
  reader.onload = (e) => {
    originalImage.value = e.target.result
    compressedImage.value = ''
    refreshIcons()
  }
  reader.readAsDataURL(file)
}

const compressImage = () => {
  if (!originalImage.value) return
  compressing.value = true
  const img = new Image()
  img.onload = () => {
    const canvas = document.createElement('canvas')
    let width = img.width
    let height = img.height
    if (width > compressWidth.value) {
      height = Math.round((compressWidth.value / width) * height)
      width = compressWidth.value
    }
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0, width, height)
    const result = canvas.toDataURL('image/jpeg', compressQuality.value / 100)
    compressedImage.value = result
    compressedSize.value = result.length
    compressing.value = false
    showToast('图片压缩成功！')
    refreshIcons()
  }
  img.src = originalImage.value
}

const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

const copyImageLink = async () => {
  if (!compressedImage.value) return
  try {
    await navigator.clipboard.writeText(compressedImage.value)
    showToast('图片链接已复制到剪贴板！')
  } catch (err) {
    showToast('复制失败，请手动复制', 'error')
  }
}

const useCompressedImage = () => {
  if (!compressedImage.value) return
  imageMaker.value.bg = 'custom'
  imageMaker.value.customImage = compressedImage.value
  showCompressTool.value = false
  showToast('已使用压缩后的图片！')
}
</script>

<style scoped>
.tag-pill {
  display: inline-flex;
  align-items: center;
}

.banner-preview {
  min-height: 160px;
}

.ad-item {
  transition: all 0.2s ease;
}

.ad-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.modal-content {
  animation: modalIn 0.2s ease;
}

@keyframes modalIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>
